import { openai } from "./openai";
import { ModerationError, RateLimitError } from "./moderation-errors";

// Re-export error classes for convenience
export { ModerationError, RateLimitError };

// Simple profanity filter as fallback
const profanityWords = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'crap', 'piss', 'dick', 'cock',
  'motherfuck', 'asshole', 'whore', 'slut', 'cunt', 'fag', 'nigger', 'retard'
];

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

/** Simple in-memory cache for moderation results */
const moderationCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/** Generate cache key for content */
function getCacheKey(content: string): string {
  // Simple hash function for caching
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `mod_${Math.abs(hash)}`;
}

/** Check if cached result is still valid */
function getCachedResult(content: string): boolean | null {
  const key = getCacheKey(content);
  const cached = moderationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  if (cached) {
    moderationCache.delete(key); // Remove expired cache
  }
  return null;
}

/** Cache moderation result */
function setCachedResult(content: string, isSafe: boolean): void {
  const key = getCacheKey(content);
  moderationCache.set(key, { result: isSafe, timestamp: Date.now() });
}

/** Sleep function for rate limiting */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Make moderation API call with retry logic */
async function moderateWithRetry(
  input: string | string[] | any[], 
  maxRetries = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure we're using the correct model as per OpenAI docs
      return await openai.moderations.create({
        model: "omni-moderation-latest",
        input,
      });
    } catch (error: any) {
      lastError = error;
      
      if (error?.status === 429) {
        // Rate limit hit - implement exponential backoff
        const retryAfter = error?.headers?.['retry-after'] 
          ? parseInt(error.headers['retry-after']) * 1000 
          : Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        
        console.warn(`Rate limit hit on attempt ${attempt}/${maxRetries}. Waiting ${retryAfter}ms...`);
        
        if (attempt < maxRetries) {
          await sleep(retryAfter);
          continue;
        } else {
          throw new RateLimitError(`Rate limit exceeded after ${maxRetries} attempts`, retryAfter);
        }
      } else {
        // Non-rate-limit error, don't retry
        throw error;
      }
    }
  }
  
  throw lastError || new Error("Moderation failed after retries");
}

/** Pull the true categories from a Moderation result */
function extractCategories(result: any): string[] {
  const cats: string[] = [];
  const categories = result?.categories ?? {};
  for (const [k, v] of Object.entries(categories)) {
    if (v === true) cats.push(k);
  }
  return cats;
}

/** Extract category scores for detailed analysis */
function extractCategoryScores(result: any): Record<string, number> {
  return result?.category_scores ?? {};
}

/** Extract which input types triggered each category */
function extractCategoryInputTypes(result: any): Record<string, string[]> {
  return result?.category_applied_input_types ?? {};
}

/** Moderate a single text blob */
export async function ensureTextIsSafe(input: string, context?: string) {
  if (!input?.trim()) return;

  console.log(`🔍 MODERATING TEXT for context: ${context || 'unknown'}`);
  console.log(`� Content preview: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`);

  // Check cache first
  const cached = getCachedResult(input);
  if (cached !== null) {
    if (!cached) {
      throw new ModerationError("Text failed safety checks (cached).", [], context);
    }
    return; // Safe according to cache
  }

  try {
    const resp = await moderateWithRetry(input);
    const result = resp?.results?.[0];
    if (!result) throw new Error("No moderation result");

    const isSafe = !result.flagged;
    setCachedResult(input, isSafe);

    console.log(`✅ TEXT MODERATION RESULT: ${isSafe ? 'SAFE' : 'FLAGGED'} for context: ${context}`);
    if (result.flagged) {
      const cats = extractCategories(result);
      const scores = extractCategoryScores(result);
      const inputTypes = extractCategoryInputTypes(result);
      console.log(`🚨 FLAGGED CATEGORIES:`, cats);
      console.log(`📊 Category scores:`, scores);
      console.log(`🎯 Input types that triggered flags:`, inputTypes);
      throw new ModerationError("Text failed safety checks.", cats, context);
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Fallback to simple profanity filter when rate limited
      console.warn(`⚠️ Moderation rate limit hit for context: ${context}. Using fallback profanity filter.`);
      
      if (containsProfanity(input)) {
        console.log(`🚨 FALLBACK FILTER: Profanity detected in "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"`);
        throw new ModerationError("Content contains inappropriate language (detected by fallback filter).", ["profanity"], context);
      } else {
        console.log(`✅ FALLBACK FILTER: Content appears safe for "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"`);
        return; // Allow content through fallback filter
      }
    }
    throw error;
  }
}

/** Moderate many short texts (e.g., tags) as a batch */
export async function ensureTextsAreSafe(inputs: string[], context?: string) {
  const filtered = inputs.filter(t => !!t && t.trim().length > 0);
  if (filtered.length === 0) return;

  console.log(`🔍 MODERATING ${filtered.length} TEXTS for context: ${context || 'unknown'}`);
  console.log(`� Content preview:`, filtered.map(t => `"${t.substring(0, 30)}${t.length > 30 ? '...' : ''}"`));

  // Check cache for all inputs first
  const uncachedInputs: string[] = [];
  const cachedResults: { input: string; isSafe: boolean }[] = [];
  
  for (const input of filtered) {
    const cached = getCachedResult(input);
    if (cached !== null) {
      cachedResults.push({ input, isSafe: cached });
    } else {
      uncachedInputs.push(input);
    }
  }

  // Check cached results for any flagged content
  for (const { input, isSafe } of cachedResults) {
    if (!isSafe) {
      throw new ModerationError(
        `Text "${input}" failed safety checks (cached).`,
        [],
        context
      );
    }
  }

  // Only moderate uncached inputs
  if (uncachedInputs.length > 0) {
    try {
      const resp = await moderateWithRetry(uncachedInputs);
      const results = resp?.results ?? [];
      
      results.forEach((r: any, idx: number) => {
        const input = uncachedInputs[idx];
        const isSafe = !r?.flagged;
        setCachedResult(input, isSafe);
        
        console.log(`✅ BATCH TEXT ${idx + 1}/${results.length} RESULT: ${isSafe ? 'SAFE' : 'FLAGGED'} for "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"`);
        
        if (r?.flagged) {
          const cats = extractCategories(r);
          const scores = extractCategoryScores(r);
          const inputTypes = extractCategoryInputTypes(r);
          console.log(`🚨 FLAGGED CATEGORIES for "${input}":`, cats);
          console.log(`📊 Category scores:`, scores);
          console.log(`🎯 Input types that triggered flags:`, inputTypes);
          throw new ModerationError(
            `Item "${input}" failed safety checks.`,
            cats,
            context
          );
        }
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        // Fallback to simple profanity filter for batch moderation when rate limited
        console.warn(`⚠️ Moderation rate limit hit for batch context: ${context}. Using fallback profanity filter.`);
        
        // Check each uncached input with fallback filter
        for (const input of uncachedInputs) {
          if (containsProfanity(input)) {
            console.log(`🚨 FALLBACK FILTER: Profanity detected in "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"`);
            throw new ModerationError(`Content "${input}" contains inappropriate language (detected by fallback filter).`, ["profanity"], context);
          }
        }
        
        console.log(`✅ FALLBACK FILTER: All batch content appears safe for context: ${context}`);
        return; // Allow content through fallback filter
      }
      throw error;
    }
  }
}

/**
 * Moderate an image by URL (e.g., a short-lived signed URL from Supabase Storage).
 * If flagged, throws ModerationError.
 */
export async function ensureImageUrlIsSafe(imageUrl: string, context?: string) {
  if (!imageUrl) return;

  console.log(`🔍 MODERATING IMAGE for context: ${context || 'unknown'}`);
  console.log(`�️ Image URL: ${imageUrl.substring(0, 80)}${imageUrl.length > 80 ? '...' : ''}`);

  // Check cache using URL as key
  const cached = getCachedResult(imageUrl);
  if (cached !== null) {
    console.log(`💾 USING CACHED IMAGE RESULT: ${cached ? 'SAFE' : 'FLAGGED'}`);
    if (!cached) {
      throw new ModerationError("Image failed safety checks (cached).", [], context);
    }
    return; // Safe according to cache
  }

  try {
    const resp = await moderateWithRetry([{ 
      type: "image_url", 
      image_url: { 
        url: imageUrl 
      } 
    }]);
    const result = resp?.results?.[0];
    if (!result) throw new Error("No moderation result");

    const isSafe = !result.flagged;
    setCachedResult(imageUrl, isSafe);

    console.log(`✅ IMAGE MODERATION RESULT: ${isSafe ? 'SAFE' : 'FLAGGED'} for context: ${context}`);

    if (result.flagged) {
      const cats = extractCategories(result);
      const scores = extractCategoryScores(result);
      const inputTypes = extractCategoryInputTypes(result);
      console.log(`🚨 IMAGE FLAGGED CATEGORIES:`, cats);
      console.log(`📊 Category scores:`, scores);
      console.log(`🎯 Input types flagged:`, inputTypes);
      throw new ModerationError("Image failed safety checks.", cats, context);
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      // For rate limit errors, be more lenient and allow content through
      console.warn(`⚠️ Image moderation rate limit hit for context: ${context}. Allowing content through.`);
      return;
    }
    throw error;
  }
}

/**
 * Moderate mixed content (text and images together) as shown in OpenAI docs
 * This allows for comprehensive moderation of listings with both text and images
 */
export async function ensureMixedContentIsSafe(
  textInputs: string[],
  imageUrls: string[],
  context?: string
) {
  const inputs: any[] = [];
  
  // Add text inputs in the format specified by OpenAI docs
  textInputs.forEach(text => {
    if (text?.trim()) {
      inputs.push({
        type: "text",
        text: text.trim()
      });
    }
  });
  
  // Add image inputs in the format specified by OpenAI docs
  imageUrls.forEach(url => {
    if (url?.trim()) {
      inputs.push({
        type: "image_url",
        image_url: {
          url: url.trim()
        }
      });
    }
  });
  
  if (inputs.length === 0) return;
  
  console.log(`🔍 MODERATING MIXED CONTENT for context: ${context || 'unknown'}`);
  console.log(`📝 Text inputs: ${textInputs.length}, 🖼️ Image inputs: ${imageUrls.length}`);
  
  try {
    const resp = await moderateWithRetry(inputs);
    const results = resp?.results ?? [];
    
    results.forEach((result: any, idx: number) => {
      if (result.flagged) {
        const cats = extractCategories(result);
        const scores = extractCategoryScores(result);
        const inputTypes = extractCategoryInputTypes(result);
        const inputType = inputs[idx]?.type || 'unknown';
        const inputContent = inputType === 'text' 
          ? inputs[idx]?.text?.substring(0, 50) + '...'
          : inputs[idx]?.image_url?.url?.substring(0, 50) + '...';
        
        console.log(`🚨 MIXED CONTENT FLAGGED - Input ${idx + 1} (${inputType}): "${inputContent}"`);
        console.log(`🚨 FLAGGED CATEGORIES:`, cats);
        console.log(`📊 Category scores:`, scores);
        console.log(`🎯 Input types that triggered flags:`, inputTypes);
        
        throw new ModerationError(
          `${inputType === 'text' ? 'Text' : 'Image'} content failed safety checks.`,
          cats,
          context
        );
      }
    });
    
    console.log(`✅ MIXED CONTENT MODERATION: All content SAFE for context: ${context}`);
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Fallback for text content only when rate limited
      console.warn(`⚠️ Mixed content moderation rate limit hit for context: ${context}. Using fallback for text only.`);
      
      for (const text of textInputs) {
        if (text?.trim() && containsProfanity(text)) {
          console.log(`🚨 FALLBACK FILTER: Profanity detected in text "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
          throw new ModerationError(`Text content contains inappropriate language (detected by fallback filter).`, ["profanity"], context);
        }
      }
      
      console.log(`✅ FALLBACK FILTER: Text content appears safe, images allowed through due to rate limit.`);
      return;
    }
    throw error;
  }
}

/** Batch moderate multiple text fields for a listing */
export async function ensureListingFieldsSafe(fields: Record<string, string>, context = "listing") {
  const nonEmptyFields = Object.entries(fields)
    .filter(([_, value]) => value && value.trim())
    .map(([key, value]) => ({ key, value: value.trim() }));

  if (nonEmptyFields.length === 0) return;

  console.log(`� MODERATING ${nonEmptyFields.length} LISTING FIELDS for context: ${context}`);
  console.log(`📋 Fields:`, nonEmptyFields.map(f => f.key).join(', '));

  // Check if we can batch these together (for efficiency)
  const values = nonEmptyFields.map(f => f.value);
  const keys = nonEmptyFields.map(f => f.key);

  try {
    await ensureTextsAreSafe(values, context);
  } catch (error) {
    if (error instanceof ModerationError) {
      // Try to identify which specific field failed
      const failedValue = error.message.match(/"([^"]+)"/)?.[1];
      if (failedValue) {
        const failedIndex = values.indexOf(failedValue);
        if (failedIndex >= 0) {
          const failedField = keys[failedIndex];
          throw new ModerationError(
            `Field "${failedField}" failed safety checks: ${error.message}`,
            error.categories,
            `${context}.${failedField}`
          );
        }
      }
    }
    throw error;
  }
}

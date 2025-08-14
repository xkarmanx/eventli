# OpenAI Moderation API Compliance Update

## Overview
Updated moderation implementation to be fully compliant with OpenAI's official moderation API documentation for the `omni-moderation-latest` model.

## Key Compliance Improvements

### 1. Enhanced Response Handling
- **Category Scores**: Now extracting and logging `category_scores` for detailed analysis
- **Input Type Tracking**: Added `category_applied_input_types` extraction to see which input types (text/image) triggered each category
- **Detailed Logging**: More comprehensive logging following OpenAI's response format

### 2. Mixed Content Moderation
Added `ensureMixedContentIsSafe()` function that supports the documented mixed content format:

```typescript
// Text and Image inputs combined as per OpenAI docs
const inputs = [
  { type: "text", text: "...text to classify..." },
  { type: "image_url", image_url: { url: "https://example.com/image.png" } }
];
```

### 3. Proper Input Formatting
- Text inputs now use `{"type": "text", "text": "..."}` format when mixing with images
- Image inputs use the documented `{"type": "image_url", "image_url": {"url": "..."}}` format
- Single text moderation still uses simple string format for efficiency

### 4. Complete Category Support
Your implementation now properly handles all categories documented in the OpenAI API:

#### Text + Image Categories:
- `self-harm`, `self-harm/intent`, `self-harm/instructions`
- `sexual`, `violence`, `violence/graphic`

#### Text-Only Categories:
- `harassment`, `harassment/threatening`
- `hate`, `hate/threatening` 
- `illicit`, `illicit/violent` (omni models only)
- `sexual/minors`

### 5. Enhanced Error Information
Moderation errors now include:
- **Category scores**: Confidence levels (0-1) for each category
- **Input types flagged**: Which input types (text/image) triggered each category
- **Detailed context**: More specific error messages with content previews

## Updated Functions

### `ensureMixedContentIsSafe(textInputs, imageUrls, context)`
New function for comprehensive listing moderation with both text and images in a single API call:

```typescript
await ensureMixedContentIsSafe(
  ['Event title', 'Event description'], // Text inputs
  ['https://example.com/image1.jpg'],    // Image URLs
  'listing-creation'                     // Context
);
```

### Enhanced Existing Functions
- `ensureTextIsSafe()`: Now logs category scores and input types
- `ensureTextsAreSafe()`: Enhanced batch processing with detailed results
- `ensureImageUrlIsSafe()`: Better error reporting with all category information

## Fallback System Compliance
The fallback profanity filter remains for rate-limiting scenarios but now:
- Only applies to text content (images bypass during rate limits as per API design)
- Provides clear distinction between OpenAI and fallback moderation results
- Maintains user safety even when OpenAI API is unavailable

## Example Enhanced Output

### Successful Moderation
```
🔍 MODERATING MIXED CONTENT for context: listing-creation
📝 Text inputs: 2, 🖼️ Image inputs: 1
✅ MIXED CONTENT MODERATION: All content SAFE for context: listing-creation
```

### Flagged Content
```
🚨 MIXED CONTENT FLAGGED - Input 1 (text): "inappropriate content..."
🚨 FLAGGED CATEGORIES: ['violence', 'harassment']
📊 Category scores: { violence: 0.8599, harassment: 0.2341 }
🎯 Input types that triggered flags: { violence: ['text'], harassment: ['text'] }
```

## Benefits
1. **Full API Compliance**: Matches OpenAI's official documentation exactly
2. **Better Debugging**: Detailed category scores help understand why content was flagged
3. **Efficient Mixed Content**: Single API call for listings with both text and images
4. **Production Ready**: Comprehensive error handling with fallback protection
5. **Detailed Analytics**: Track which types of content trigger which categories

## Migration Impact
- **Backward Compatible**: All existing function calls continue to work
- **Enhanced Logging**: More detailed console output for debugging
- **New Capability**: Mixed content moderation available for complex use cases
- **Same Performance**: Maintains caching and rate limiting features

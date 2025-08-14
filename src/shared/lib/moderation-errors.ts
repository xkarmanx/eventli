/** Custom error for moderation failures */
export class ModerationError extends Error {
  public categories: string[];
  public context?: string;

  constructor(message: string, categories: string[] = [], context?: string) {
    super(message);
    this.categories = categories;
    this.context = context;
    this.name = "ModerationError";
  }
}

/** Custom error for rate limiting */
export class RateLimitError extends Error {
  public retryAfter?: number;

  constructor(message: string = "Rate limit exceeded. Please try again later.", retryAfter?: number) {
    super(message);
    this.retryAfter = retryAfter;
    this.name = "RateLimitError";
  }
}

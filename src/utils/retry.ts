/**
 * @example
 * const onRetry: RetryHandler = (error, index) => { ... };
 * await retry(fn, { count, delay, onRetry });
 */
export type RetryHandler = (error: unknown, index: number) => void | Promise<void>;

/**
 * @param options.count default: 3
 * @param options.delay default: 1000
 * @example
 * const fn = async () => { return 1; };
 * const count = 3;
 * const delay = 1000;
 * const onRetry: RetryHandler = (error, index) => { ... };
 * const result = await retry(fn, { count, delay, onRetry }); // 1
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    count?: number;
    delay?: number;
    onRetry?: RetryHandler;
  },
): Promise<T> {
  const { count = 3, delay = 1000, onRetry } = options ?? {};
  let lastError: unknown;

  for (let i = 0; i < count; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < count - 1) {
        await onRetry?.(err, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

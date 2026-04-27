/**
 * @example
 * await sleep(1000);
 * // wait 1s...
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

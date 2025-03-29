/**
 * Asserts that a value is not null or undefined.
 * Throws an error with the provided message if the condition is false.
 *
 * @param condition The condition to assert
 * @param message Optional message or error to throw
 */
export function invariant<T>(
  condition: T | null | undefined,
  message?: string,
): asserts condition is T {
  if (condition === null || condition === undefined) {
    throw new Error(message || 'Invariant failed: value is null or undefined')
  }
}

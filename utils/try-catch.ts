/**
 * @packageDocumentation
 * Utilities for working with Promises in a simple tuple-based "result" style.
 *
 * This module provides a small helper that converts a Promise<T> into a Promise
 * of a discriminated tuple result: [T, null] on success, or [null, ErrorLike] on failure.
 * This pattern makes it easy to consume asynchronous results without try/catch
 * blocks and to use simple destructuring for error handling.
 *
 * Example:
 * ```ts
 * import { tryCatch } from './utils/try-catch';
 *
 * const [data, error] = await tryCatch(fetch('/api/data').then(r => r.json()));
 * if (error) {
 *   // handle error
 * } else {
 *   // use data
 * }
 * ```
 *
 * Notes:
 * - The helper awaits the provided Promise and returns a tuple where exactly one
 *   element is non-null: the value on success or the error on failure.
 * - The error is cast to the generic error type E (defaults to Error). If the
 *   runtime rejection value is a non-Error object, narrow/check as needed.
 * - The tuple types are readonly to encourage treating results as immutable.
 */

/**
 * A successful result tuple.
 *
 * Represents a successful outcome where the first element contains the value of
 * type T and the second element is null.
 *
 * Example:
 * ```ts
 * const success: SuccessResult<number> = [42, null];
 * ```
 *
 * @typeParam T - The success value type.
 */

/**
 * An error result tuple.
 *
 * Represents a failed outcome where the first element is null and the second
 * element contains the error value (by default an Error).
 *
 * Example:
 * ```ts
 * const failure: ErrorResult = [null, new Error('oops')];
 * ```
 *
 * @typeParam E - The error value type (defaults to Error).
 */

/**
 * A union of SuccessResult<T> and ErrorResult<E>.
 *
 * This type models the two possible outcomes returned from `tryCatch`:
 * - [T, null] when the promise resolves successfully.
 * - [null, E] when the promise rejects.
 *
 * Use destructuring to inspect the returned tuple and branch on the presence
 * of an error.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error value type (defaults to Error).
 */

/**
 * Await a promise and return a tuple of [value, null] on success or [null, error]
 * on failure.
 *
 * This function provides a compact alternative to try/catch for promise-based
 * code, enabling patterns like:
 *
 * ```ts
 * const [result, err] = await tryCatch(someAsyncOp());
 * if (err) {
 *   // handle error
 * }
 * ```
 *
 * The error value is cast to the generic error type `E`. If you expect a specific
 * error shape, provide the appropriate type parameter and narrow/check at runtime.
 *
 * @typeParam T - The expected resolved value type of the provided promise.
 * @typeParam E - The expected rejection/error type (defaults to Error).
 * @param promise - A Promise that resolves to T or rejects with E.
 * @returns A Promise that resolves to a Result<T, E> tuple:
 * - [value, null] when the input promise fulfills.
 * - [null, error] when the input promise rejects.
 *
 * @example
 * ```ts
 * const [user, err] = await tryCatch<User, ApiError>(fetchUser(userId));
 * if (err) {
 *   // handle ApiError
 * } else {
 *   // use user
 * }
 * ```
 */
type SuccessResult<T> = readonly [T, null];
type ErrorResult<E = Error> = readonly [null, E];

type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return [data, null] as const;
  } catch (error) {
    return [null, error as E] as const;
  }
}

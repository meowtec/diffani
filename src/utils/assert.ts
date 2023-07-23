export function assert<T>(
  obj: T | null | undefined,
  message: string
): asserts obj is T {
  if (obj == null) {
    throw new TypeError(message);
  }
}

export function assertNonNull<T>(
  obj: T | null | undefined,
  message = 'object should not be null'
): T {
  if (obj == null) {
    throw new TypeError(message);
  }

  return obj;
}

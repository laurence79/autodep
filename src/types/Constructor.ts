/**
 * Any type that can be constructed.
 */
export type Constructor<T = unknown> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
};

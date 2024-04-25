/**
 * Any type that can be constructed.
 */
export type Constructor<T = any> = {
  new (...args: any[]): T;
};

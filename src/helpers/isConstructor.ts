import { Constructor } from '../types/Constructor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isConstructor = <T = any>(obj: unknown): obj is Constructor<T> => {
  return typeof obj === 'function' && obj.prototype !== undefined;
};

export default isConstructor;

import { Constructor } from '../Constructor';

const isConstructor = <T = unknown>(obj: unknown): obj is Constructor<T> => {
  return typeof obj === 'function' && obj.prototype !== undefined;
};

export default isConstructor;

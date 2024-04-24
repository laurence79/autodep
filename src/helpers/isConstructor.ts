import { Constructor } from '../types/Constructor';

const isConstructor = (obj: unknown): obj is Constructor => {
  return typeof obj === 'function' && obj.prototype !== undefined;
};

export default isConstructor;

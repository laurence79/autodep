import type { Token } from './Token';

export interface Resolver {
  resolve<T>(token: Token<T>): T;
}

import type { Token } from './Token';

export interface Resolver {
  /**
   * Asks the resolver to resolve an object.
   * @param token a previously registered token
   */
  resolve<T>(token: Token<T>): T;
}

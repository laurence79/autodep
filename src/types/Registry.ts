import type { Constructor } from './Constructor';
import type { Registration } from './Registration';
import type { Token } from './Token';

export interface Registry {
  getLocalRegistration<T>(constructor: Constructor<T>): Registration<T> | null;

  getConstructor<T>(token: Token<T>): Constructor<T>;
}

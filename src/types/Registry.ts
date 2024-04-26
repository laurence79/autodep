import { Constructor } from './Constructor';
import { Registration } from './Registration';
import { Token } from './Token';

export interface Registry {
  getLocalRegistration<T>(constructor: Constructor<T>): Registration<T> | null;

  getConstructor<T>(token: Token<T>): Constructor<T>;
}

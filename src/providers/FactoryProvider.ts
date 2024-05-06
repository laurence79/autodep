import type ResolutionContext from '../ResolutionContext';
import type { Constructor } from '../types/Constructor';
import type { Provider } from '../types/Provider';
import type { Resolver } from '../types/Resolver';

export type FactoryFn<T> = (
  resolver: Resolver,
  resolutionChain: Constructor[]
) => T;

class FactoryProvider<T> implements Provider<T> {
  constructor(private readonly fn: FactoryFn<T>) {}

  provide(context: ResolutionContext): T {
    return this.fn(context.resolver, context.resolutionChain);
  }
}

export default FactoryProvider;

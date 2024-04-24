import ResolutionContext from '../ResolutionContext';
import { Provider } from '../types/Provider';
import { Resolver } from '../types/Resolver';
import { Token } from '../types/Token';

export type FactoryFn<T> = (resolver: Resolver, resolutionChain: Token[]) => T;

class FactoryProvider<T> implements Provider<T> {
  constructor(private readonly fn: FactoryFn<T>) {}

  provide(context: ResolutionContext): T {
    return this.fn(context.resolver, context.resolutionChain);
  }
}

export default FactoryProvider;

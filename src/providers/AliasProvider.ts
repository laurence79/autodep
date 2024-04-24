import ResolutionContext from '../ResolutionContext';
import { Provider } from '../types/Provider';
import { Token } from '../types/Token';

class AliasProvider<T1, T2 extends T1> implements Provider<T1> {
  constructor(private readonly of: Token<T2>) {}

  provide(context: ResolutionContext): T1 {
    return context.resolver.resolveWithContext(
      this.of,
      context.withReplaceHead(this.of)
    );
  }
}

export default AliasProvider;

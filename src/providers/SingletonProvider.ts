import ResolutionContext from '../ResolutionContext';
import { Provider } from '../types/Provider';

class SingletonProvider<T> implements Provider<T> {
  constructor(private readonly innerProvider: Provider<T>) {}

  private instance: T | undefined;

  provide(context: ResolutionContext): T {
    return (
      this.instance ?? (this.instance = this.innerProvider.provide(context))
    );
  }
}

export default SingletonProvider;

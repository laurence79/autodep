/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Provider } from '../types/Provider';
import { Constructor } from '../types/Constructor';
import ResolutionContext from '../ResolutionContext';

class ConstructProvider<T> implements Provider<T> {
  constructor(private readonly ctor: Constructor<T>) {}

  private readonly params =
    (Reflect.getMetadata('design:paramtypes', this.ctor) as any[]) || [];

  provide(context: ResolutionContext): T {
    if (!this.params || this.params.length === 0) {
      if (this.ctor.length === 0) {
        return new this.ctor();
      } else {
        throw new Error(`Unable to construct "${this.ctor.name}".`);
      }
    }

    const deps = this.params.map(param =>
      context.resolver.resolveWithContext(
        param as Constructor,
        context.withAppendToChain(param)
      )
    );

    return new this.ctor(...deps);
  }
}

export default ConstructProvider;

import type ResolutionContext from '../ResolutionContext';
import type { Constructor } from '../types/Constructor';
import type { Provider } from '../types/Provider';
import type { Token } from '../types/Token';

class ConstructProvider<T> implements Provider<T> {
  constructor(private readonly ctor: Constructor<T>) {}

  private readonly reflectParams =
    ('getMetadata' in Reflect &&
      (Reflect.getMetadata('design:paramtypes', this.ctor) as unknown[])) ||
    [];

  provide(context: ResolutionContext): T {
    if (!this.reflectParams || this.reflectParams.length === 0) {
      if (this.ctor.length === 0) {
        return new this.ctor();
      } else {
        throw new Error(`Unable to construct "${this.ctor.name}".`);
      }
    }

    const deps = this.reflectParams.map(param =>
      context.resolver.resolveWithContext(param as Token, context)
    );

    return new this.ctor(...deps);
  }
}

export default ConstructProvider;

import ResolutionContext from '../ResolutionContext';
import DisposableOnce from '../common/DisposableOnce';
import tryDisposeItem from '../helpers/tryDisposeItem';
import ConstructProvider from '../providers/ConstructProvider';
import { Constructor } from '../types/Constructor';
import { InternalResolver } from '../types/InternalResolver';
import { Registry } from '../types/Registry';
import { Token } from '../types/Token';

class SingletonLifecycleManager
  extends DisposableOnce
  implements AsyncDisposable
{
  constructor(
    private readonly registry: Registry,
    private readonly resolver: InternalResolver
  ) {
    super();
  }

  private readonly instances = new Map<Constructor, unknown>();

  async dispose(): Promise<void> {
    await Promise.all([...this.instances.values()].map(tryDisposeItem));

    this.instances.clear();
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    if (this.instances.has(constructor)) {
      return this.instances.get(constructor) as T;
    }

    const maybeRegistration = this.registry.getLocalRegistration(constructor);

    if (!maybeRegistration && this.resolver.parent) {
      return this.resolver.parent.resolveWithContext(
        constructor,
        context.withResolver(this.resolver.parent)
      );
    }

    const provider =
      maybeRegistration?.provider ?? new ConstructProvider(constructor);

    const instance = provider.provide(context);

    this.instances.set(constructor, instance);

    return instance;
  }
}

export default SingletonLifecycleManager;

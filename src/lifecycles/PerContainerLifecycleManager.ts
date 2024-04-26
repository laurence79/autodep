import ResolutionContext from '../ResolutionContext';
import DisposableOnce from '../common/DisposableOnce';
import tryDisposeItem from '../helpers/tryDisposeItem';
import { Constructor } from '../types/Constructor';
import { InternalResolver } from '../types/InternalResolver';
import { Registry } from '../types/Registry';
import { Token } from '../types/Token';

class PerContainerLifecycleManager
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

  protected async dispose(): Promise<void> {
    await Promise.all([...this.instances.values()].map(tryDisposeItem));
    this.instances.clear();
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    if (this.instances.has(constructor)) {
      return this.instances.get(constructor) as T;
    }

    const instance = this.resolver.construct(token, context);

    this.instances.set(constructor, instance);

    return instance;
  }
}

export default PerContainerLifecycleManager;

import ResolutionContext from '../ResolutionContext';
import DisposableOnce from '../common/DisposableOnce';
import tryDisposeItem from '../helpers/tryDisposeItem';
import { Token } from '../types/Token';
import { LifecycleManager } from './LifecycleManager';

class TransientLifecycleManager
  extends DisposableOnce
  implements LifecycleManager, AsyncDisposable
{
  private readonly instances = new Set<WeakRef<object>>();

  async dispose(): Promise<void> {
    await Promise.all(
      [...this.instances.values()].map(async ref => {
        const obj = ref.deref();
        if (obj) {
          await tryDisposeItem(obj);
        }
      })
    );

    this.instances.clear();
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const instance = context.resolver.construct(token, context);

    this.instances.add(new WeakRef(instance as object));

    return instance;
  }
}

export default TransientLifecycleManager;

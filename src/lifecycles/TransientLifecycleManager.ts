import Registry from '../Registry';
import ResolutionContext from '../ResolutionContext';
import tryDisposeItem from '../helpers/tryDisposeItem';
import ConstructProvider from '../providers/ConstructProvider';
import { Token } from '../types/Token';
import { LifecycleManager } from './LifecycleManager';

class TransientLifecycleManager implements LifecycleManager, AsyncDisposable {
  public static readonly alias = 'transient';

  constructor(private readonly registry: Registry) {}

  private readonly instances = new Set<WeakRef<object>>();

  private _disposed = false;

  public get disposed() {
    return this._disposed;
  }

  private throwIfDisposed() {
    if (this._disposed) {
      throw new Error('Can not use a disposed lifecycle.');
    }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    this.throwIfDisposed();

    this._disposed = true;

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

    const constructor = this.registry.getConstructor(token);

    const provider =
      this.registry.getRegistration(constructor)?.[0] ??
      new ConstructProvider(constructor);

    const instance = provider.provide(context);

    this.instances.add(new WeakRef(instance as object));

    return instance;
  }
}

export default TransientLifecycleManager;

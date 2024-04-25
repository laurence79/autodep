import Registry from '../Registry';
import ResolutionContext from '../ResolutionContext';
import tryDisposeItem from '../helpers/tryDisposeItem';
import ConstructProvider from '../providers/ConstructProvider';
import { Constructor } from '../types/Constructor';
import { Token } from '../types/Token';
import { Lifecycle } from './Lifecycle';
import { LifecycleManager } from './LifecycleManager';

class PerContainerLifecycleManager
  implements LifecycleManager, AsyncDisposable
{
  public static readonly alias = 'perContainer';

  constructor(private readonly registry: Registry) {}

  private readonly instances = new Map<Constructor, unknown>();

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

    await Promise.all([...this.instances.values()].map(tryDisposeItem));

    this.instances.clear();
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    if (this.instances.has(constructor)) {
      return this.instances.get(constructor) as T;
    }

    const [provider] = this.registry.getRegistration(constructor) ?? [
      new ConstructProvider(constructor),
      { lifecycle: Lifecycle.transient }
    ];

    const instance = provider.provide(context);

    this.instances.set(constructor, instance);

    return instance;
  }
}

export default PerContainerLifecycleManager;

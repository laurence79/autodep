import Registry from '../Registry';
import ResolutionContext from '../ResolutionContext';
import tryDisposeItem from '../helpers/tryDisposeItem';
import ConstructProvider from '../providers/ConstructProvider';
import { Constructor } from '../types/Constructor';
import { Token } from '../types/Token';
import { LifecycleManager } from './LifecycleManager';

class PerResolutionLifecycleManager
  implements LifecycleManager, AsyncDisposable
{
  public static readonly alias = 'perResolution';

  constructor(private readonly registry: Registry) {}

  private readonly caches = new WeakMap<object, Map<Constructor, unknown>>();

  private readonly instances = new Map<Constructor, WeakRef<object>>();

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

  private getOrCreateCache(context: ResolutionContext) {
    const { resolutionId } = context;

    let cache = this.caches.get(resolutionId);

    if (!cache) {
      cache = new Map();
      this.caches.set(resolutionId, cache);
    }

    return cache;
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const cache = this.getOrCreateCache(context);

    const constructor = this.registry.getConstructor(token);

    if (cache.has(constructor)) {
      return cache.get(constructor) as T;
    }

    const provider =
      this.registry.getRegistration(constructor)?.[0] ??
      new ConstructProvider(constructor);

    const instance = provider.provide(context);

    cache.set(constructor, instance);

    return instance;
  }
}

export default PerResolutionLifecycleManager;

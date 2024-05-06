import type ResolutionContext from '../ResolutionContext';
import type { Constructor } from '../types/Constructor';
import { isDisposable } from '../types/guards/isDisposable';
import type { InternalResolver } from '../types/InternalResolver';
import type { Registry } from '../types/Registry';
import type { Token } from '../types/Token';

import WeakLifecycleManager from './WeakLifecycleManager';

class PerResolutionLifecycleManager extends WeakLifecycleManager {
  constructor(
    private readonly registry: Registry,
    private readonly resolver: InternalResolver
  ) {
    super();
  }

  private readonly caches = new WeakMap<object, Map<Constructor, unknown>>();

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

    const instance = this.resolver.construct(constructor, context);
    cache.set(constructor, instance);

    this.addInstance(constructor, instance);

    if (isDisposable(instance)) {
      this.addDisposable(instance);
    }

    return instance;
  }
}

export default PerResolutionLifecycleManager;

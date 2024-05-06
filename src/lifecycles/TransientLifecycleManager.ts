import type ResolutionContext from '../ResolutionContext';
import { isDisposable } from '../types/guards/isDisposable';
import type { InternalResolver } from '../types/InternalResolver';
import type { Registry } from '../types/Registry';
import type { Token } from '../types/Token';

import WeakLifecycleManager from './WeakLifecycleManager';

class TransientLifecycleManager extends WeakLifecycleManager {
  constructor(
    private readonly registry: Registry,
    private readonly resolver: InternalResolver
  ) {
    super();
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    const instance = this.resolver.construct(token, context);

    this.addInstance(constructor, new WeakRef(instance as object));

    if (isDisposable(instance)) {
      this.addDisposable(instance);
    }

    return instance;
  }
}

export default TransientLifecycleManager;

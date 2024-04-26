import ResolutionContext from '../ResolutionContext';
import { InternalResolver } from '../types/InternalResolver';
import { Registry } from '../types/Registry';
import { Token } from '../types/Token';
import { isDisposable } from '../types/guards/isDisposable';
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

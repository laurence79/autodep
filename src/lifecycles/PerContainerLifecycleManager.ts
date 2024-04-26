import ResolutionContext from '../ResolutionContext';
import { InternalResolver } from '../types/InternalResolver';
import { Registry } from '../types/Registry';
import { Token } from '../types/Token';
import { isDisposable } from '../types/guards/isDisposable';
import StrongLifecycleManager from './StrongLifecycleManager';

class PerContainerLifecycleManager extends StrongLifecycleManager {
  constructor(
    private readonly registry: Registry,
    private readonly resolver: InternalResolver
  ) {
    super();
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    const maybeInstance = this.getInstance<T>(constructor);
    if (maybeInstance) {
      return maybeInstance;
    }

    const instance = this.resolver.construct(token, context);

    this.retainInstance(constructor, instance);

    if (isDisposable(instance)) {
      this.addDisposable(instance);
    }

    return instance;
  }
}

export default PerContainerLifecycleManager;

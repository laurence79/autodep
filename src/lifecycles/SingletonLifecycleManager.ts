import ConstructProvider from '../providers/ConstructProvider';
import type ResolutionContext from '../ResolutionContext';
import type { Constructor } from '../types/Constructor';
import { isDisposable } from '../types/guards/isDisposable';
import type { InternalResolver } from '../types/InternalResolver';
import type { Registry } from '../types/Registry';
import type { Token } from '../types/Token';

import StrongLifecycleManager from './StrongLifecycleManager';

class SingletonLifecycleManager extends StrongLifecycleManager {
  constructor(
    private readonly registry: Registry,
    private readonly resolver: InternalResolver
  ) {
    super();
  }

  public injectInstance<T>(ctor: Constructor<T>, instance: T) {
    this.throwIfDisposed();

    this.retainInstance(ctor, instance);
  }

  public provide<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    const maybeInstance = this.getInstance<T>(constructor);
    if (maybeInstance) {
      return maybeInstance;
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

    this.retainInstance(constructor, instance);

    if (isDisposable(instance)) {
      this.addDisposable(instance);
    }

    return instance;
  }
}

export default SingletonLifecycleManager;

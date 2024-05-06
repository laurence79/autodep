import DisposableOnce from './common/DisposableOnce';
import Container from './Container';
import { Lifecycle } from './lifecycles/Lifecycle';
import PerContainerLifecycleManager from './lifecycles/PerContainerLifecycleManager';
import PerResolutionLifecycleManager from './lifecycles/PerResolutionLifecycleManager';
import SingletonLifecycleManager from './lifecycles/SingletonLifecycleManager';
import TransientLifecycleManager from './lifecycles/TransientLifecycleManager';
import ConstructProvider from './providers/ConstructProvider';
import FactoryProvider, { type FactoryFn } from './providers/FactoryProvider';
import ResolutionContext from './ResolutionContext';
import type { Constructor } from './types/Constructor';
import isConstructor from './types/guards/isConstructor';
import isRegistrationOptions from './types/guards/isRegistrationOptions';
import type { InternalResolver } from './types/InternalResolver';
import type { Registration } from './types/Registration';
import type {
  RegistrationOptions,
  SingletonRegistrationOptions
} from './types/RegistrationOptions';
import type { Registry } from './types/Registry';
import type { Token } from './types/Token';

class InternalContainer
  extends DisposableOnce
  implements Container, InternalResolver, Registry
{
  constructor(public readonly parent?: InternalContainer) {
    super();

    this.registerAlias(Container, InternalContainer);
    this.registerSingleton(InternalContainer, this);
  }

  private readonly aliases = new Map<Token, Token>();

  private readonly registrations = new Map<Constructor, Registration>();

  private readonly lifecycles = {
    [Lifecycle.singleton]: new SingletonLifecycleManager(this, this),
    [Lifecycle.perContainer]: new PerContainerLifecycleManager(this, this),
    [Lifecycle.perResolution]: new PerResolutionLifecycleManager(this, this),
    [Lifecycle.transient]: new TransientLifecycleManager(this, this)
  } as const;

  private readonly childContainers = new Set<WeakRef<InternalContainer>>();

  public deAlias<T>(token: Token<T>): Token<T> | null {
    let current: Token | undefined = token;
    let leaf: Token = token;

    while (current) {
      leaf = current;
      current = this.aliases.get(current);
    }

    if (this.parent) {
      return this.parent.deAlias(leaf);
    }

    return leaf;
  }

  public getConstructor<T>(token: Token<T>): Constructor<T> {
    const constructor = this.deAlias(token);

    if (!isConstructor<T>(constructor)) {
      throw new Error(
        `No constructor for token ${String(token)}. Leaf alias ${String(constructor)} is not a constructor`
      );
    }

    return constructor;
  }

  public construct<T>(token: Token<T>, context: ResolutionContext): T {
    const ctor = this.getConstructor(token);

    const provider =
      this.getRegistration(ctor)?.provider ?? new ConstructProvider(ctor);

    return provider.provide(context);
  }

  public getLocalRegistration<T>(
    constructor: Constructor<T>
  ): Registration<T> | null {
    return (this.registrations.get(constructor) as Registration<T>) ?? null;
  }

  public getRegistration<T>(
    constructor: Constructor<T>
  ): Registration<T> | null {
    return (
      this.getLocalRegistration(constructor) ??
      this.parent?.getRegistration(constructor) ??
      null
    );
  }

  public createChildContainer() {
    this.throwIfDisposed();

    const child = new InternalContainer(this);
    this.childContainers.add(new WeakRef(child));

    return child;
  }

  public register<T>(
    ctor: Constructor<T>,
    options?: RegistrationOptions
  ): this {
    this.throwIfDisposed();

    this.registrations.set(ctor, {
      provider: new ConstructProvider(ctor),
      options: options ?? { lifecycle: Lifecycle.transient }
    });

    return this;
  }

  public registerAlias<T1, T2 extends T1>(
    from: Token<T1>,
    to: Token<T2>
  ): this {
    this.throwIfDisposed();

    this.aliases.set(from, to);

    return this;
  }

  public registerFactory<T>(
    ctor: Constructor<T>,
    factory: FactoryFn<T>,
    options?: RegistrationOptions
  ) {
    this.throwIfDisposed();

    this.registrations.set(ctor, {
      provider: new FactoryProvider(factory),
      options: options ?? { lifecycle: Lifecycle.transient }
    });

    return this;
  }

  public registerSingleton<T>(
    ctor: Constructor<T>,
    instanceOrOptions?: T | SingletonRegistrationOptions
  ) {
    this.throwIfDisposed();

    const instance = !isRegistrationOptions(instanceOrOptions)
      ? instanceOrOptions
      : undefined;

    const options = isRegistrationOptions(instanceOrOptions)
      ? instanceOrOptions
      : { lifecycle: Lifecycle.singleton };

    if (instance) {
      this.registrations.set(ctor, { options });

      this.lifecycles[Lifecycle.singleton].injectInstance(ctor, instance);

      return this;
    }

    return this.register(ctor, options);
  }

  public resolve<T>(token: Token<T>): T {
    const context = new ResolutionContext(new Object(), this, []);

    return this.resolveWithContext(token, context);
  }

  public resolveWithContext<T>(
    token: Token<T>,
    contextIn: ResolutionContext
  ): T {
    this.throwIfDisposed();

    const constructor = this.getConstructor(token);

    const context = contextIn.withAppendToChain(constructor);

    const lifecycle =
      this.getRegistration(constructor)?.options.lifecycle ??
      Lifecycle.transient;

    return this.lifecycles[lifecycle].provide(token, context);
  }

  async dispose(): Promise<void> {
    await Promise.all([
      ...Object.values(this.lifecycles).map(
        l => !l.disposed && l[Symbol.asyncDispose]()
      ),

      ...[...this.childContainers.values()].map(async ref => {
        const child = ref.deref();
        if (child && !child.disposed) {
          await child[Symbol.asyncDispose]();
        }
      })
    ]);

    this.childContainers.clear();
  }
}

export default InternalContainer;

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ResolutionContext from './ResolutionContext';
import ConstructProvider from './providers/ConstructProvider';
import FactoryProvider, { FactoryFn } from './providers/FactoryProvider';
import InstanceProvider from './providers/InstanceProvider';
import { Token } from './types/Token';
import { RegistrationOptions } from './types/RegistrationOptions';
import { Constructor } from './types/Constructor';
import { InternalResolver } from './types/InternalResolver';
import Container from './Container';
import { Lifecycle } from './lifecycles/Lifecycle';
import Registry from './Registry';
import LifecycleManagers from './lifecycles/LifecycleManagers';

class InternalContainer extends Container implements InternalResolver {
  constructor(public readonly parent?: InternalContainer) {
    super();

    this.registry = new Registry(parent?.registry);
    this.lifecycles = new LifecycleManagers(this.registry);

    this.registerAlias(Container, InternalContainer);
    this.registerSingleton(InternalContainer, this);
  }

  private readonly registry: Registry;

  private readonly lifecycles: LifecycleManagers;

  private _disposed = false;

  public get disposed() {
    return this._disposed;
  }

  private readonly childContainers = new Set<WeakRef<InternalContainer>>();

  private throwIfDisposed() {
    if (this._disposed) {
      throw new Error('Can not use a disposed container.');
    }
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

    this.registry.register(
      ctor,
      new ConstructProvider(ctor),
      options ?? { lifecycle: Lifecycle.transient }
    );

    return this;
  }

  public registerAlias<T1, T2 extends T1>(
    from: Token<T1>,
    to: Token<T2>
  ): this {
    this.throwIfDisposed();

    this.registry.registerAlias(from, to);

    return this;
  }

  public registerFactory<T>(
    ctor: Constructor<T>,
    factory: FactoryFn<T>,
    options?: RegistrationOptions
  ) {
    this.throwIfDisposed();

    this.registry.register(
      ctor,
      new FactoryProvider(factory),
      options ?? { lifecycle: Lifecycle.transient }
    );

    return this;
  }

  public registerSingleton<T>(ctor: Constructor<T>, maybeInstance?: T) {
    this.throwIfDisposed();

    if (maybeInstance) {
      this.registry.register(ctor, new InstanceProvider(maybeInstance), {
        lifecycle: Lifecycle.singleton
      });

      return this;
    }

    return this.register(ctor, { lifecycle: Lifecycle.singleton });
  }

  public resolve<T>(token: Token<T>): T {
    const context = new ResolutionContext(new Object(), this, [token]);

    return this.resolveWithContext(token, context);
  }

  public resolveWithContext<T>(token: Token<T>, context: ResolutionContext): T {
    this.throwIfDisposed();

    const constructor = this.registry.getConstructor(token);

    const lifecycle =
      this.registry.getRegistration(constructor)?.[1].lifecycle ??
      Lifecycle.transient;

    return this.lifecycles.getLifecycle(lifecycle).provide(token, context);
  }

  async [Symbol.asyncDispose](): Promise<void> {
    this.throwIfDisposed();

    this._disposed = true;

    await Promise.all([
      this.lifecycles[Symbol.asyncDispose](),

      ...[...this.childContainers.values()].map(ref =>
        ref.deref()?.[Symbol.asyncDispose]()
      )
    ]);

    this.childContainers.clear();
  }
}

export default InternalContainer;

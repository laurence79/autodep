/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ResolutionContext from './ResolutionContext';
import ConstructProvider from './providers/ConstructProvider';
import FactoryProvider, { FactoryFn } from './providers/FactoryProvider';
import InstanceProvider from './providers/InstanceProvider';
import AliasProvider from './providers/AliasProvider';
import SingletonProvider from './providers/SingletonProvider';
import { Provider } from './types/Provider';
import { Token } from './types/Token';
import { RegistrationOptions } from './types/RegistrationOptions';
import { Scope } from './Scope';
import { Constructor } from './types/Constructor';
import isConstructor from './helpers/isConstructor';
import { InternalResolver } from './types/InternalResolver';
import { Resolver } from './types/Resolver';
import { Registry } from './types/Registry';

class InternalContainer implements Registry, Resolver, InternalResolver {
  constructor(public readonly parent?: InternalContainer) {
    this.registerSingleton(InternalContainer, this);
  }

  private providers = new Map<Token, Provider>();

  private options = new Map<Token, RegistrationOptions>();

  public createChildContainer() {
    return new InternalContainer(this);
  }

  public register<T>(ctor: Constructor<T>, options: RegistrationOptions): this {
    this.providers.set(ctor, new ConstructProvider(this, ctor));
    this.options.set(ctor, options);
    return this;
  }

  public registerAlias<T1, T2 extends T1>(
    from: Token<T1>,
    to: Token<T2>
  ): this {
    this.providers.set(from, new AliasProvider(to));
    return this;
  }

  public registerFactory<T>(
    token: Token<T>,
    factory: FactoryFn<T>,
    maybeOptions?: RegistrationOptions
  ) {
    this.providers.set(token, new FactoryProvider(factory));

    if (maybeOptions) {
      this.options.set(token, maybeOptions);
    }

    return this;
  }

  public registerSingleton<T>(ctor: Constructor<T>, maybeInstance?: T) {
    if (maybeInstance) {
      this.providers.set(ctor, new InstanceProvider(maybeInstance));
      return this;
    }

    this.providers.set(
      ctor,
      new SingletonProvider(new ConstructProvider(this, ctor))
    );
    return this;
  }

  public resolve<T>(token: Token<T>): T {
    const context = new ResolutionContext(this, undefined, [token]);
    return this.resolveWithContext(token, context);
  }

  public resolveWithContext<T>(token: Token<T>, context: ResolutionContext): T {
    const shouldCache = this.options.get(token)?.scope === Scope.resolution;

    if (shouldCache && context.cache.has(token)) {
      return context.cache.get(token) as T;
    }

    const registeredProvider = this.providers.get(token) as
      | Provider<T>
      | undefined;

    if (!registeredProvider && this.parent) {
      return this.parent.resolve(token);
    }

    const provider =
      registeredProvider ??
      (isConstructor(token) ? new ConstructProvider<T>(this, token) : null);

    if (!provider) {
      throw new Error(`Can not resolve ${String(token)}`);
    }

    const instance = provider.provide(context);

    if (shouldCache) {
      context.cache.set(token, instance);
    }

    return instance;
  }
}

export default InternalContainer;

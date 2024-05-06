import type { FactoryFn } from './providers/FactoryProvider';
import type { Constructor } from './types/Constructor';
import type {
  RegistrationOptions,
  SingletonRegistrationOptions
} from './types/RegistrationOptions';
import type { Resolver } from './types/Resolver';
import type { Token } from './types/Token';

abstract class Container implements Resolver, AsyncDisposable {
  /**
   * Indicates whether the container has been previously disposed using
   * [Symbol.asyncDispose]()
   */
  public abstract readonly disposed: boolean;

  /**
   * creates a new container with it's own distinct lifetimes and optionally
   * further or overridden registrations.
   */
  public abstract createChildContainer(): Container;

  /**
   * Registers a constructor for use in resolution.
   * @param ctor A constructor
   * @param options Options affecting registration and resolution
   */
  public abstract register<T>(
    ctor: Constructor<T>,
    options?: RegistrationOptions
  ): this;

  /**
   * Registers a mapping between types.
   * Use to register an alternative implementation for a class
   * @param from A token, or constructor to map from
   * @param to A token, or constructor to map to
   */
  public abstract registerAlias<T1, T2 extends T1>(
    from: Token<T1>,
    to: Token<T2>
  ): this;

  /**
   * Registers a factory function for use in resolution.
   * @param ctor A constructor
   * @param factory The factory function for creating instances
   */
  public abstract registerFactory<T>(
    ctor: Constructor<T>,
    factory: FactoryFn<T>
  ): this;
  /**
   * Registers a factory function for use in resolution.
   * @param ctor A constructor
   * @param factory The factory function for creating instances
   * @param options Options affecting registration and resolution
   */
  public abstract registerFactory<T>(
    ctor: Constructor<T>,
    factory: FactoryFn<T>,
    options: RegistrationOptions
  ): this;

  /**
   * Registers a type as a singleton.
   * Shorthand for `register(ctor, { lifecycle: Lifecycle.singleton })`
   * @param ctor A constructor
   */
  public abstract registerSingleton<T>(ctor: Constructor<T>): this;
  /**
   * Registers an instance as a singleton.
   * @param ctor A constructor
   * @param instance A pre-created instance to use as the singleton
   */
  public abstract registerSingleton<T>(ctor: Constructor<T>, instance: T): this;
  /**
   * Registers a type as a singleton, or per-container singleton.
   * @param ctor A constructor
   * @param options Options affecting registration and resolution
   */
  public abstract registerSingleton<T>(
    ctor: Constructor<T>,
    options: SingletonRegistrationOptions
  ): this;

  /**
   * Asks the resolver to resolve an object.
   * @param token a previously registered token
   */
  public abstract resolve<T>(token: Token<T>): T;

  /**
   * Disposes the container, along with all it's child containers and instances.
   */
  public abstract [Symbol.asyncDispose](): PromiseLike<void>;
}

export default Container;

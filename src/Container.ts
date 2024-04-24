/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FactoryFn } from './providers/FactoryProvider';
import { Token } from './types/Token';
import { RegistrationOptions } from './types/RegistrationOptions';
import { Constructor } from './types/Constructor';
import { Registry } from './types/Registry';
import { Resolver } from './types/Resolver';
import InternalContainer from './InternalContainer';

abstract class Container implements Registry, Resolver {
  public static create(): Container {
    return new InternalContainer();
  }

  public abstract createChildContainer(): Container;

  public abstract register<T>(
    ctor: Constructor<T>,
    options: RegistrationOptions
  ): this;

  public abstract registerAlias<T1, T2 extends T1>(
    from: Token<T1>,
    to: Token<T2>
  ): this;

  public abstract registerFactory<T>(
    token: Token<T>,
    factory: FactoryFn<T>
  ): this;
  public abstract registerFactory<T>(
    token: Token<T>,
    factory: FactoryFn<T>,
    options: RegistrationOptions
  ): this;

  public abstract registerSingleton<T>(ctor: Constructor<T>): this;
  public abstract registerSingleton<T>(ctor: Constructor<T>, instance: T): this;

  public abstract resolve<T>(token: Token<T>): T;
}

export default Container;

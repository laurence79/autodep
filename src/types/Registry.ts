import { FactoryFn } from '../providers/FactoryProvider';
import type { Constructor } from './Constructor';
import type { RegistrationOptions } from './RegistrationOptions';
import { Token } from './Token';

export interface Registry {
  register<T>(ctor: Constructor<T>, options: RegistrationOptions): this;
  registerAlias<T1, T2 extends T1>(from: Token<T1>, to: Token<T2>): this;
  registerFactory<T>(token: Token<T>, factory: FactoryFn<T>): this;
  registerFactory<T>(
    token: Token<T>,
    factory: FactoryFn<T>,
    options: RegistrationOptions
  ): this;
  registerSingleton<T>(ctor: Constructor<T>): this;
  registerSingleton<T>(ctor: Constructor<T>, instance: T): this;
}

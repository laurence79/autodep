import type { Lifecycle } from '../lifecycles/Lifecycle';

/**
 * Options affecting the registration and resolution of a type.
 */
export type RegistrationOptions<TLifecycle = Lifecycle> = {
  lifecycle: TLifecycle;
};

export type SingletonRegistrationOptions = RegistrationOptions<
  Extract<Lifecycle, 'singleton' | 'perContainer'>
>;

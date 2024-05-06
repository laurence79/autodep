import type { RegistrationOptions } from '../RegistrationOptions';

const isRegistrationOptions = <T>(
  obj: unknown
): obj is RegistrationOptions<T> => {
  return !!obj && typeof obj === 'object' && 'lifecycle' in obj;
};

export default isRegistrationOptions;

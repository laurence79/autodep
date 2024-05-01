import type { Provider } from './Provider';
import type { RegistrationOptions } from './RegistrationOptions';

export interface Registration<T = unknown> {
  readonly provider?: Provider<T>;
  readonly options: RegistrationOptions;
}

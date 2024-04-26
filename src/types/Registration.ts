import { Provider } from './Provider';
import { RegistrationOptions } from './RegistrationOptions';

export interface Registration<T = unknown> {
  readonly provider?: Provider<T>;
  readonly options: RegistrationOptions;
}

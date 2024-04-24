/* eslint-disable @typescript-eslint/no-explicit-any */
import type ResolutionContext from '../ResolutionContext';

export interface Provider<T = any> {
  provide(context: ResolutionContext): T;
}

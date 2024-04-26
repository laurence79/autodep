import type ResolutionContext from '../ResolutionContext';

export interface Provider<T = unknown> {
  provide(context: ResolutionContext): T;
}

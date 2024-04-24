import type { Token } from './Token';
import type ResolutionContext from '../ResolutionContext';

export interface InternalResolver {
  resolveWithContext<T>(token: Token<T>, context: ResolutionContext): T;
}

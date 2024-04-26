import type { Token } from './Token';
import type ResolutionContext from '../ResolutionContext';
import { Resolver } from './Resolver';

export interface InternalResolver extends Resolver {
  readonly parent?: InternalResolver;
  resolveWithContext<T>(token: Token<T>, context: ResolutionContext): T;
  construct<T>(token: Token<T>, context: ResolutionContext): T;
}

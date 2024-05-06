import type ResolutionContext from '../ResolutionContext';

import { Resolver } from './Resolver';
import type { Token } from './Token';

export interface InternalResolver extends Resolver {
  readonly parent?: InternalResolver;
  resolveWithContext<T>(token: Token<T>, context: ResolutionContext): T;
  construct<T>(token: Token<T>, context: ResolutionContext): T;
}

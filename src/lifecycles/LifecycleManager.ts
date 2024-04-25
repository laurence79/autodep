import ResolutionContext from '../ResolutionContext';
import { Token } from '../types/Token';

export interface LifecycleManager {
  provide<T>(token: Token<T>, context: ResolutionContext): T;
}

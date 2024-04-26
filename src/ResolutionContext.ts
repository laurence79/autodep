import { Constructor } from './types/Constructor';
import { InternalResolver } from './types/InternalResolver';

class ResolutionContext {
  constructor(
    public readonly resolutionId: object,
    public readonly resolver: InternalResolver,
    public readonly resolutionChain: Constructor[] = []
  ) {}

  public withAppendToChain(constructor: Constructor) {
    return new ResolutionContext(this.resolutionId, this.resolver, [
      constructor,
      ...this.resolutionChain
    ]);
  }

  public withResolver(resolver: InternalResolver) {
    return new ResolutionContext(
      this.resolutionId,
      resolver,
      this.resolutionChain
    );
  }
}

export default ResolutionContext;

import InternalContainer from './InternalContainer';
import { Constructor } from './types/Constructor';

class ResolutionContext {
  constructor(
    public readonly resolutionId: object,
    public readonly resolver: InternalContainer,
    public readonly resolutionChain: Constructor[] = []
  ) {}

  public withAppend(constructor: Constructor) {
    return new ResolutionContext(this.resolutionId, this.resolver, [
      constructor,
      ...this.resolutionChain
    ]);
  }

  public withResolver(resolver: InternalContainer) {
    return new ResolutionContext(
      this.resolutionId,
      resolver,
      this.resolutionChain
    );
  }
}

export default ResolutionContext;

import InternalContainer from './InternalContainer';
import { Token } from './types/Token';

class ResolutionContext {
  constructor(
    public readonly resolutionId: object,
    public readonly resolver: InternalContainer,
    public readonly resolutionChain: Token[] = []
  ) {}

  public withAppend(token: Token) {
    return new ResolutionContext(this.resolutionId, this.resolver, [
      token,
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalResolver } from './types/InternalResolver';
import { Resolver } from './types/Resolver';
import { Token } from './types/Token';

class ResolutionContext {
  constructor(
    public readonly resolver: Resolver & InternalResolver,
    public readonly cache = new Map<Token, any>(),
    public readonly resolutionChain: Token[] = []
  ) {}

  public withReplaceHead(token: Token) {
    return new ResolutionContext(this.resolver, this.cache, [
      token,
      ...this.resolutionChain.slice(1)
    ]);
  }

  public withAppend(token: Token) {
    return new ResolutionContext(this.resolver, this.cache, [
      token,
      ...this.resolutionChain
    ]);
  }
}

export default ResolutionContext;

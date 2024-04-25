import isConstructor from './helpers/isConstructor';
import { Constructor } from './types/Constructor';
import { Provider } from './types/Provider';
import { RegistrationOptions } from './types/RegistrationOptions';
import { Token } from './types/Token';

class Registry {
  constructor(private readonly parent?: Registry) {}

  private readonly aliases = new Map<Token, Token>();

  private readonly registrations = new Map<
    Constructor,
    [Provider, RegistrationOptions]
  >();

  public deAlias<T>(token: Token<T>): Token<T> | null {
    let current: Token | undefined = token;
    let leaf: Token = token;

    while (current) {
      leaf = current;
      current = this.aliases.get(current);
    }

    if (this.parent) {
      return this.parent.deAlias(leaf);
    }

    return leaf;
  }

  public getConstructor<T>(token: Token<T>): Constructor<T> {
    const constructor = this.deAlias(token);

    if (!isConstructor<T>(constructor)) {
      throw new Error(
        `No constructor for token ${String(token)}. Leaf alias ${String(constructor)} is not a constructor`
      );
    }

    return constructor;
  }

  public registerAlias(from: Token, to: Token) {
    this.aliases.set(from, to);
  }

  public register(
    constructor: Constructor,
    provider: Provider,
    options: RegistrationOptions
  ) {
    this.registrations.set(constructor, [provider, options]);
  }

  public getLocalRegistration<T>(
    constructor: Constructor<T>
  ): [Provider<T>, RegistrationOptions] | null {
    return this.registrations.get(constructor) ?? null;
  }

  public getRegistration<T>(
    constructor: Constructor<T>
  ): [Provider<T>, RegistrationOptions] | null {
    return (
      this.getLocalRegistration(constructor) ??
      this.parent?.getRegistration(constructor) ??
      null
    );
  }
}

export default Registry;

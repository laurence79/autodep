import Container from './Container';
import createContainer from './createContainer';
import injectable from './decorators/injectable';
import isConstructor from './helpers/isConstructor';
import { Scope } from './Scope';

it('returns registered instances', () => {
  class A {}

  const container = createContainer();
  const instance = new A();

  container.registerSingleton(A, instance);

  const resolved = container.resolve(A);

  expect(instance).toBe(resolved);
});

it('constructs unregistered types if they have no params', () => {
  class A {}

  const container = createContainer();

  const instance = container.resolve(A);

  expect(instance).toBeInstanceOf(A);
});

it('creates instances with dependencies', () => {
  class B {}

  @injectable()
  class A {
    constructor(public b: B) {}
  }

  const container = createContainer();

  const instance = container.resolve(A);

  expect(instance).toBeInstanceOf(A);
  expect(instance.b).toBeInstanceOf(B);
});

it('throws an error if unregistered type has params', () => {
  class A {
    constructor(public b: string) {}
  }

  const container = createContainer();

  expect(() => container.resolve(A)).toThrow('Unable to construct "A"');
});

it('uses registered instances when resolving dependencies', () => {
  class B {}

  @injectable()
  class A {
    constructor(public b: B) {}
  }

  const container = createContainer();
  const instance = new B();
  container.registerSingleton(B, instance);

  expect(container.resolve(A).b).toBe(instance);
});

it('singletons resolve to the same instance each time', () => {
  class A {}

  const container = createContainer();
  container.registerSingleton(A);

  const one = container.resolve(A);
  const two = container.resolve(A);

  expect(one).toBe(two);
});

it("defers to the parent container if type can't be resolved locally", () => {
  class A {}

  const container = createContainer();
  const instance = new A();
  container.registerSingleton(A, instance);

  const child = container.createChildContainer();

  expect(child.resolve(A)).toBe(instance);
});

it('handles registering an extended type to be resolved in place of a superclass', () => {
  class A {}
  class B extends A {}

  const container = createContainer();
  container.registerAlias(A, B);

  const instance = container.resolve(A);
  expect(instance).toBeInstanceOf(B);
});

it('handles registering an extended type to be resolved in place of a abstract base class', () => {
  abstract class A {}
  class B extends A {}

  const container = createContainer();
  container.registerAlias(A, B);

  const instance = container.resolve(A);
  expect(instance).toBeInstanceOf(B);
});

it('handles registering a factory', () => {
  class A {
    constructor(public greeting: string) {}
  }

  const container = createContainer();
  container.registerFactory(A, () => new A('hello'));

  const instance = container.resolve(A);
  expect(instance.greeting).toEqual('hello');
});

it('factory can use resolution chain', () => {
  class Logger {
    constructor(public type: string) {}
  }

  @injectable()
  class Service {
    constructor(public logger: Logger) {}
  }

  const container = createContainer();
  container.registerFactory(Logger, (_, chain) => {
    const receivingToken = chain.at(1);
    const name =
      receivingToken && isConstructor(receivingToken)
        ? receivingToken.name
        : '';
    return new Logger(name);
  });

  const instance = container.resolve(Service);
  expect(instance.logger.type).toEqual('Service');
});

it('Resolution scoped registration resolves multiple dependencies of the same type as the same instance', () => {
  class A {}

  @injectable()
  class B {
    constructor(public a: A) {}
  }

  @injectable()
  class C {
    constructor(public a: A, public b: B) {}
  }

  const container = createContainer();
  container.register(A, { scope: Scope.resolution });

  const instance = container.resolve(C);

  expect(instance.a).toBe(instance.b.a);
});

it('Transient scoped registration resolves multiple dependencies of the same type to different instances', () => {
  class A {}

  @injectable()
  class B {
    constructor(public a: A) {}
  }

  @injectable()
  class C {
    constructor(public a: A, public b: B) {}
  }

  const container = createContainer();
  container.register(A, { scope: Scope.transient });

  const instance = container.resolve(C);

  expect(instance.a).not.toBe(instance.b.a);
});

it('can inject the container', () => {
  @injectable()
  class A {
    constructor(public container: Container) {}
  }

  const container = createContainer();
  const instance = container.resolve(A);

  expect(instance.container).toBe(container);
});

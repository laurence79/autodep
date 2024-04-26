import createContainer from '../createContainer';
import injectable from '../decorators/injectable';

it('Transient lifecycle registration resolves multiple dependencies of the same type to different instances', () => {
  class A {}

  @injectable()
  class B {
    constructor(public a: A) {}
  }

  @injectable()
  class C {
    constructor(
      public a: A,
      public b: B
    ) {}
  }

  const container = createContainer();
  container.register(A);

  const instance = container.resolve(C);

  expect(instance.a).not.toBe(instance.b.a);
});

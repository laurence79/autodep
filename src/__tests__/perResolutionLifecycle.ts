import createContainer from '../createContainer';
import injectable from '../decorators/injectable';
import { Lifecycle } from '../lifecycles/Lifecycle';

test('Per resolution lifecycle registration resolves multiple dependencies of the same type as the same instance', () => {
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
  container.register(A, { lifecycle: Lifecycle.perResolution });

  const instance = container.resolve(C);

  expect(instance.a).toBe(instance.b.a);
});

import createContainer from '../createContainer';
import { Lifecycle } from '../lifecycles/Lifecycle';

it('per container singletons resolve to the same instance for each container', () => {
  class A {}

  const container = createContainer();
  container.register(A, { lifecycle: Lifecycle.perContainer });

  const parentOne = container.resolve(A);
  const parentTwo = container.resolve(A);

  expect(parentOne).toBe(parentTwo);

  const child = container.createChildContainer();

  const childOne = child.resolve(A);
  const childTwo = child.resolve(A);

  expect(childOne).toBe(childTwo);

  expect(parentOne).not.toBe(childOne);
});

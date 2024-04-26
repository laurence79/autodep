import createContainer from '../createContainer';

test("defers to the parent container if type can't be resolved locally", () => {
  class A {}

  const container = createContainer();
  const instance = new A();
  container.registerSingleton(A, instance);

  const child = container.createChildContainer();

  expect(child.resolve(A)).toBe(instance);
});

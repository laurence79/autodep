import createContainer from '../createContainer';

it('singletons resolve to the same instance each time', () => {
  class A {}

  const container = createContainer();
  container.registerSingleton(A);

  const one = container.resolve(A);
  const two = container.resolve(A);

  expect(one).toBe(two);

  const child = container.createChildContainer();

  const childOne = child.resolve(A);
  const childTwo = child.resolve(A);

  expect(childOne).toBe(childTwo);

  expect(one).toBe(childOne);
});

import createContainer from '../createContainer';

it('singletons resolve to the same instance each time', () => {
  class A {}

  const container = createContainer();
  container.registerSingleton(A);

  const one = container.resolve(A);
  const two = container.resolve(A);

  expect(one).toBe(two);
});

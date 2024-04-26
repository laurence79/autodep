import createContainer from '../createContainer';

it('disposes instances when the container disposes', async () => {
  class A implements Disposable {
    public disposed = false;

    [Symbol.dispose](): void {
      this.disposed = true;
    }
  }

  let instance: A;

  {
    await using container = createContainer();
    container.register(A);
    instance = container.resolve(A);
  }

  expect(instance.disposed).toBe(true);
});

it('child container only disposes instances it resolved', async () => {
  class A implements Disposable {
    public disposed = false;

    [Symbol.dispose](): void {
      this.disposed = true;
    }
  }

  const container = createContainer();
  container.register(A);
  const instanceOne = container.resolve(A);

  let instanceTwo: A;
  {
    await using child = container.createChildContainer();
    instanceTwo = child.resolve(A);
  }

  expect(instanceOne.disposed).toBe(false);
  expect(instanceTwo.disposed).toBe(true);
});

it('parent container disposes child containers', async () => {
  const container = createContainer();
  const child = container.createChildContainer();

  await container[Symbol.asyncDispose]();

  expect(container.disposed).toBe(true);
  expect(child.disposed).toBe(true);
});

it('parent singletons resolved by a child are not disposed with the child', async () => {
  class A implements Disposable {
    public disposed = false;

    [Symbol.dispose](): void {
      this.disposed = true;
    }
  }

  const container = createContainer();
  container.registerSingleton(A);

  let instance: A;

  {
    await using child = container.createChildContainer();
    instance = child.resolve(A);
  }

  expect(instance.disposed).toBe(false);
});

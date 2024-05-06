import Container from '../Container';
import createContainer from '../createContainer';
import injectable from '../decorators/injectable';

test('disposes instances when the container disposes', async () => {
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

test('child container only disposes instances it resolved', async () => {
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

test('parent container disposes child containers', async () => {
  const container = createContainer();
  const child = container.createChildContainer();

  await container[Symbol.asyncDispose]();

  expect(container.disposed).toBe(true);
  expect(child.disposed).toBe(true);
});

test('parent singletons resolved by a child are not disposed with the child', async () => {
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

test("container does not dispose instances it didn't create", async () => {
  class A implements Disposable {
    public disposed = false;

    [Symbol.dispose](): void {
      this.disposed = true;
    }
  }

  const instance = new A();
  {
    await using container = createContainer();
    container.registerSingleton(A, instance);
    container.resolve(A);
  }

  expect(instance.disposed).toBe(false);
});

test('only disposes child containers if they are not already disposed', async () => {
  @injectable()
  class A {
    constructor(public container: Container) {}
  }

  await using container = createContainer();
  await using child = container.createChildContainer();
  child.resolve(A);
});

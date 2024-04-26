import createContainer from '../createContainer';
import injectable from '../decorators/injectable';
import isConstructor from '../helpers/isConstructor';

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

import createContainer from '../createContainer';
import injectable from '../decorators/injectable';
import { Constructor } from '../types/Constructor';

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
  let receivedChain: Constructor[];

  container.registerFactory(Logger, (_, chain) => {
    receivedChain = chain;
    const receivingClass = chain.at(1);
    const name = receivingClass ? receivingClass.name : '';
    return new Logger(name);
  });

  const instance = container.resolve(Service);

  expect(receivedChain!).toEqual([Logger, Service]);
  expect(instance.logger.type).toEqual('Service');
});

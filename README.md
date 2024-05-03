# Autodep

An opinionated Inversion-of-Control container for typescript.

Heavily inspired by Microsoft's [tsyringe](https://github.com/microsoft/tsyringe) and [unity](https://github.com/unitycontainer/unity). But with some different choices.

**Key features**
- Supports abstract base classes as an alternative to interfaces.

- Supports the modern `Symbol.disposable` (and `Symbol.asyncDisposable`) approach to disposables.

- Singletons are "owned" by the container they are registered with, not the container that resolves them.


## Getting started

### Install
Install using npm or yarn.
```sh
npm i @autodep/container

# optional, but recommended
npm i reflect-metadata
```

The container can work without any reflection support - you can register all of your types and their dependencies manually, but [reflect-metadata](https://github.com/rbuckton/reflect-metadata) and the `@injectable()` decorator it enables really simplify this.

### Setup
You can use the `reflect-metadata` package to add runtime reflection capability to decorated classes.

1. Import `reflect-metadata` in your entrypoint.
```ts
// index.ts

import 'reflect-metadata'
```
2. Add the `tsconfig.json` options that `reflect-metadata` requires.
```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## Using the container

### Create a root container
```ts
import { createContainer } from '@autodep/container';

const container = createContainer();
```
You can have as many root containers as you like. For typical use you will most likely have a single root container, and create child containers for different scopes - a request in a REST api, or perhaps a page in a UI application.

### Register some types
#### Using the `@injectable()` decorator
If you have installed and set up the `reflect-metadata` package, you can use the `@injectable()` decorator to inject reflection information for the container to use at runtime.
```ts
import { injectable } from '@autodep/container';

@injectable()
class Controller { 
  constructor(
    private logger: Logger,
    private service: Service
  ) {}
}
```

#### Using a factory
As an alternative, you can register a factory that just uses the container to resolve the type's dependencies, but you need to list them out.
```ts
class Controller { 
  constructor(
    private logger: Logger,
    private service: Service
  ) {}
}

container.registerFactory(
  Controller,
  (c) => new Controller(
    c.resolve(Logger),
    c.resolve(Service)
  )
);
```
Using a factory does unlock some more advanced use cases, such as using information about where the dependency is going to be used
```ts
class Logger {
  constructor(name: string) {}
}

container.registerFactory(
  Logger,
  (_, resolutionChain) => {
    const receivingClass = resolutionChain.at(1);
    return new Logger(receivingClass?.name ?? '');
  }
);
```

### Lifecycles
By default, all registered classes (and unregistered classes with a parameterless constructor) will be resolved with a transient lifecycle. That is, a new instance of the class will be created every time it is resolved.

You can override this behaviour by explicitly registering the class with a different lifecycle.
```ts
class Service {}

// construct a new instance every time (default)
container.register(Service, {
  lifecycle: Lifecycle.transient
});

// construct at most one new instance for each
// resolution
container.register(Service, {
  lifecycle: Lifecycle.perResolution
});

// construct at most one instance for each container
container.register(Service, {
  lifecycle: Lifecycle.perContainer
});

// at most one instance for this container and all
// of its children
container.register(Service, {
  lifecycle: Lifecycle.singleton
});
// or use this convenience method
container.registerSingleton(Service);
```

### Automatically inject dependencies

```ts
// will create an instance of Controller and also
// instances of Logger and Service that it needs
const instance = container.resolve(Controller);
```


## Some compromises
As typescript does not emit any type data in it's output, it can be difficult to use reflection type approaches to do automated inversion of control, but there are some workarounds

### Abstract classes instead of interfaces
Interfaces do not exist at runtime, but abstract classes do. Due to the duck-typed nature of Typescript, classes can `implement` abstract classes (as if they were interfaces) and so can be used as an alternative in most cases.

```ts
// instinct says to use an interface here, but 
// interfaces are lost at runtime
abstract class Logger {
  abstract log(message: string);
}

// note the implements, not extends
class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }
}

// this method checks that ConsoleLogger is a 
// suitable implementation of Logger
container.registerAlias(Logger, ConsoleLogger);
```

## Disposable

Containers can use the `Symbol.disposable` and `Symbol.asyncDisposable` methods for handling instance disposals. See [Typescript 5.2 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html) for more details on using this approach.
```ts
class Foo {
  [Symbol.disposable]() {
    console.log('Bye now!');
  }
}

const container = createContainer();

{
  using child = container.createChild();
  const instance = container.resolve(Foo);
}

// Bye now!
```
**NOTE** Containers will only dispose of objects they create, i.e. not ones where you provide the instance
```ts
const instance = new DisposableThing();

{
  await using container = createContainer();
  container.registerSingleton(instance);
}

// instance is not disposed
```

## Garbage collection

Lifecycles either retain a _strong_ or _weak_ reference to instances they create.

**A strong reference** - will keep the object alive until the container is disposed, or goes out of scope.

**A weak reference** - will allow the object to be garbage collected if there is no other reference to it in your code. If the object are still alive when the container is disposed (or itself goes out of scope) they will be disposed too.


| Lifecycle           | Description                                                                                                                                                                                                                                                       | Reference |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| Transient (default) | A new object should be constructed for the type for each dependency.  The container will hold a weak reference to the object, which if disposable will be disposed along with the container if it hasn't already been garbage collected.                          | Weak      |
| Per resolution      | During a resolution, a maximum of one object of the type will be created for each dependency.  The container will hold a weak reference to the object, which if disposable will be disposed along with the container if it hasn't already been garbage collected. | Weak      |
| Per container       | A maximum of one object of the type will be created in the container. Child containers will have their own object of the type.  The container will hold a strong reference to the object, which if disposable will be disposed along with the container.          | Strong    |
| Singleton           | A maximum of one object of the type will be created in the container. Child containers will also resolve to this object.  The container will hold a strong reference to the object, which if disposable will be disposed along with the container.                | Strong    |

Containers hold weak references to their child containers, that is, those created with `createChildContainer()`.
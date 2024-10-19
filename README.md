# Autodep

An opinionated dependency injection container for typescript.

Heavily inspired by Microsoft's [tsyringe](https://github.com/microsoft/tsyringe) and [unity](https://github.com/unitycontainer/unity). But with some different choices.

**Key features**
- Supports abstract base classes as an alternative to interfaces.

- Supports the modern `Symbol.disposable` (and `Symbol.asyncDisposable`) approach to disposables.

- Singletons are "owned" by the container they are registered with, not the container that resolves them.


## Background

Most automated dependency injection frameworks use a reflection-based approach to discover dependencies. This can be a challenge with Typescript because type data isn't available at runtime. But there are some workarounds

### reflect-metadata [package](https://github.com/rbuckton/reflect-metadata)
This package emits type information for class constructors as javascript objects, as long as the class has a decorator. Autodep can optionally use this to infer constructor parameters and their types.

### Abstract classes instead of interfaces
You will notice that none of the examples use interfaces. This is because they do not exist at runtime, but abstract classes do. Due to the duck-typed nature of Typescript (and Javascript), classes can `implement` abstract classes (as if they were interfaces) and so can be used as an alternative to interfaces in most cases.


## Getting started

### Install
Install using npm
```sh
npm i @autodep/container
```
or yarn
```sh
yarn add @autodep/container
```

The container can work without any reflection support - you can register all of your types and their dependencies manually, but [reflect-metadata](https://github.com/rbuckton/reflect-metadata) and the `@injectable()` decorator that is part of this package really simplify this.

### Setup
If you are going to use the `@injectable()` decorator, add the `tsconfig.json` options that `reflect-metadata` requires.
```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

### Usage with swc
Add these options to your `.swcrc` file
```json
{
  "$schema": "https://swc.rs/schema.json",
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true
    },
    "transform": {
      "decoratorMetadata": true
    }
  }
}
```

## Using the container
```ts
import { createContainer } from '@autodep/container';

const container = createContainer();
```
You can have as many containers as you like. For typical use you will most likely have a single root container, and create child containers for different scopes - a request in a REST api, or perhaps a page in a UI application.


### Registering classes

Registration of classes without dependencies is optional, unless you want to control the lifecycle (see below).
```ts
class SimpleService {}

// parameterless constructor, no need to register
const instance = container.resolve(SimpleService);
```


### Registering classes with dependencies

The container needs to know what _Types_ it should supply to constructors

#### Using the `@injectable()` decorator
If you have installed and set up the `reflect-metadata` package, you can use the `@injectable()` decorator to emit reflection information with the javascript output for the container to use at runtime.

When the container needs to construct an instance, it uses the emitted metadata to resolve instances of dependencies and supply them to the constructor
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
Using a factory does unlock some more advanced use cases, such as using information about where the dependency is going to be injected
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
#### Using an alias
An alias instructs the container to return a more derived class in place of a base class.
```ts
abstract class ConfigProvider {
  abstract readonly connectionString: string;
}

class EnvConfigProvider implements ConfigProvider {
  get connectionString() {
    return process.env.CONNECTION_STRING;
  }
}

container.registerAlias(ConfigProvider, EnvConfigProvider);
```
Any class with a `ConfigProvider` dependency will be injected with the `EnvConfigProvider` concrete class.


### Lifecycles
By default, all classes will be resolved with a transient lifecycle. That is, a new instance of the class will be created every time it is resolved.

You can override this behaviour by explicitly registering the class with a different lifecycle.
```ts
@injectable()
class Service {
  constructor(config: ConfigProvider) {}
}

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
The container will be able to automatically create instances, and instances of its dependencies from
- Classes with a parameterless constructor
- Classes with a registered factory
- Classes decorated with `injectable()`

```ts
// will create an instance of Controller and also
// instances of Logger and Service that it needs
const instance = container.resolve(Controller);
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

### Polyfill
Your environment might need a Polyfill to support `Symbol.disposable` and `Symbol.asyncDisposable`.
```ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');
```

## References and Garbage collection

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


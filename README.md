# ts-ioc

An opinionated Inversion of Control container for typescript.

Heavily inspired by Microsoft's [tsyringe](https://github.com/microsoft/tsyringe) and [unity](https://github.com/unitycontainer/unity). But with some different choices.


## Getting started

### Install
Install using npm or yarn.
```sh
npm i @laurence79/ts-ioc reflect-metadata
```
or
```sh
yarn add @laurence79/ts-ioc reflect-metadata
```
### Setup
Be sure to import `relfect-metadata` in your entrypoint.

This library uses the [reflect-metadata](https://github.com/rbuckton/reflect-metadata) package to add reflection support to your javascript output, but it only does this when a class has been decorated.
```ts
// index.ts

import 'reflect-metadata'
```
Add the `emitDecoratorMetadata` and `experimentalDecorators` typescript config options to support `reflect-metadata`
```json
// tsconfig.json

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
import { createContainer } from '@laurence79/ts-ioc';

const container = createContainer();
```

### Register a type
```ts
class Logger {}
class Service {}

// this is optional, unless you want to control the 
// object's lifetime. The container will by default 
// create transient instances for the dependencies of
// any class decorated with injectable()
container.register(Logger);

// only one of these will be created by this container
// or any of it's children
container.registerSingleton(Service);
```

### Automatically inject constructor dependencies.

**NOTE** the `injectable()` decorator to enable ts-ioc to reflect on the constructor of `Controller`
```ts
import { injectable } from '@laurence79/ts-ioc';

@injectable()
class Controller { 
  constructor(
    private logger: Logger,
    private service: Service
  ) {}
}

const instance = container.resolve(Controller);
```

## Object lifecycles

When registering a type with the container, you can specify whether it should retain a _strong_ or _weak_ reference to instances of the type it creates, and how many of each type it should create.

### Strong references
Will keep the object alive until the container is disposed.

### Weak references
Will allow the objects to be garbage collected if there is no other reference to them in your code. If the objects are still alive when the container is disposed they will be disposed too.

```ts
// a new one every time
container.register(Class, { lifecycle: Lifecycle.transient });

// at most one new instance for each resolution
container.register(Class, { lifecycle: Lifecycle.perResolution });

// at most one new instance for each container
container.register(Class, { lifecycle: Lifecycle.perContainer });

// at most one instance for this container and all of it's children
container.register(Class, { lifecycle: Lifecycle.singleton });
```

| Name                | Description                                                                                                                                                                                                                                                       | Reference |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| Transient (default) | A new object should be constructed for the type for each dependency.  The container will hold a weak reference to the object, which if disposable will be disposed along with the container if it hasn't already been garbage collected.                          | Weak      |
| Per resolution      | During a resolution, a maximum of one object of the type will be created for each dependency.  The container will hold a weak reference to the object, which if disposable will be disposed along with the container if it hasn't already been garbage collected. | Weak      |
| Per container       | A maximum of one object of the type will be created in the container. Child containers will have their own object of the type.  The container will hold a strong reference to the object, which if disposable will be disposed along with the container.          | Strong    |
| Singleton           | A maximum of one object of the type will be created in the container. Child containers will also resolve to this object.  The container will hold a strong reference to the object, which if disposable will be disposed along with the container.                | Strong    |


## Disposable

Containers support the new [Symbol.disposable] and [Symbol.asyncDisposable] method for doing disposals. See [Typescript 5.2 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html)
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


## Some compromises
As typescript does not emit any type data in it's output, it can be difficult to use reflection type approaches to do automated inversion of control.

It is not possible to use interfaces at runtime, but abstract classes can be used as an alternative in most cases.

In order for `ts-ioc` to be able to infer the dependencies in a constructor, the class needs to be decorated with the `@injectable()` decorator from this package.

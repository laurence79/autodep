# ts-ioc

An opinionated Inversion of Control container for typescript.

Heavily inspired by Microsoft's [tsyringe](https://github.com/microsoft/tsyringe) and [unity](https://github.com/unitycontainer/unity). But with some different choices.


## Some compromises
As typescript does not emit any type data in it's output, it can be difficult to use reflection type approaches to do automated inversion of control.

This library uses the [reflect-metadata](https://github.com/rbuckton/reflect-metadata) package to add reflection support to your javascript output, but it only does this when a class has been decorated.

It is not possible to use interfaces at runtime.

In order for `ts-ioc` to be able to infer the dependencies in a constructor, the class needs to be decorated with the `@injectable()` decorator from this package.


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
```ts
// index.ts

import 'reflect-metadata'
```
Add the `emitDecoratorMetadata` and `experimentalDecorators` typescript config options to support `reflect-metadata`
```json
// tsconfig.json

{
  ...
  "compilerOptions": {
    ...
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    ...
  }
}
```



## Using the container

Create a root container
```ts
import { createContainer } from '@laurence79/ts-ioc';

const container = createContainer();
```

Register a type
```ts
class Logger {}
class Service {}

// this is optional, unless you want to control the objects lifetime
container.register(Logger);

container.registerSingleton(Service);
```

Automatically inject constructor dependencies.

**NOTE** the decorator to enable ts-ioc to reflect on the constructor of `Controller`
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
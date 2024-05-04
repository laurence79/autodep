import 'reflect-metadata';

/**
 * Capture reflection metadata about a constructor
 * @returns a decorator
 */
function injectable() {
  return function (target: object) {
    Reflect.defineMetadata('autodep:injectable', true, target);
  };
}

export default injectable;

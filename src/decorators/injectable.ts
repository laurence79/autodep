/**
 * Capture reflection metadata about a constructor
 * @returns a decorator
 */
function injectable() {
  return function (target: object) {
    Reflect.defineMetadata('ioc:injectable', true, target);
  };
}

export default injectable;

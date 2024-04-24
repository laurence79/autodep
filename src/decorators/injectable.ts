/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
function injectable() {
  return function (target: any) {
    Reflect.defineMetadata('ioc:injectable', true, target);
  };
}

export default injectable;

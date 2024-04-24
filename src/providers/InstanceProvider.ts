import { Provider } from '../types/Provider';

class InstanceProvider<T> implements Provider<T> {
  constructor(private readonly instance: T) {}

  provide(): T {
    return this.instance;
  }
}

export default InstanceProvider;

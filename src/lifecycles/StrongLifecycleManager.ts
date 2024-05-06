import type { Constructor } from '../types/Constructor';

import DisposableLifecycleManager from './DisposableLifecycleManager';

class StrongLifecycleManager extends DisposableLifecycleManager {
  private readonly instances = new Map<Constructor, unknown>();

  protected retainInstance<T>(ctor: Constructor, instance: T) {
    this.instances.set(ctor, instance);
  }

  protected getInstance<T>(ctor: Constructor): T | undefined {
    if (this.instances.has(ctor)) {
      return this.instances.get(ctor) as T;
    }

    return undefined;
  }

  protected override dispose(): Promise<void> {
    this.instances.clear();
    return super.dispose();
  }
}

export default StrongLifecycleManager;

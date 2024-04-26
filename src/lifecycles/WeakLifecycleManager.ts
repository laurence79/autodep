import { Constructor } from '../types/Constructor';
import DisposableLifecycleManager from './DisposableLifecycleManager';

class WeakLifecycleManager extends DisposableLifecycleManager {
  private readonly instances = new Map<Constructor, WeakRef<object>>();

  protected addInstance<T>(ctor: Constructor, instance: T) {
    this.instances.set(ctor, new WeakRef(instance as object));
  }

  protected getInstance<T>(ctor: Constructor): T | undefined {
    return (this.instances.get(ctor)?.deref() as T) ?? undefined;
  }

  protected override dispose(): Promise<void> {
    this.instances.clear();
    return super.dispose();
  }
}

export default WeakLifecycleManager;

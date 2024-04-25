import Registry from '../Registry';
import { KeysMatching } from '../types/KeysMatching';
import { LifecycleManager } from './LifecycleManager';
import PerContainerLifecycleManager from './PerContainerLifecycleManager';
import PerResolutionLifecycleManager from './PerResolutionLifecycleManager';
import SingletonLifecycleManager from './SingletonLifecycleManager';
import TransientLifecycleManager from './TransientLifecycleManager';

export type Lifecycle = KeysMatching<LifecycleManagers, LifecycleManager>;

class LifecycleManagers implements AsyncDisposable {
  constructor(private readonly registry: Registry) {}

  public readonly singleton = new SingletonLifecycleManager(this.registry);

  public readonly perContainer = new PerContainerLifecycleManager(
    this.registry
  );

  public readonly perResolution = new PerResolutionLifecycleManager(
    this.registry
  );

  public readonly transient = new TransientLifecycleManager(this.registry);

  private _disposed = false;

  public get disposed() {
    return this._disposed;
  }

  public getLifecycle(lifecycle: Lifecycle): LifecycleManager {
    this.throwIfDisposed();

    return this[lifecycle];
  }

  private throwIfDisposed() {
    if (this._disposed) {
      throw new Error('Can not use a disposed lifecycle manager.');
    }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    this.throwIfDisposed();

    this._disposed = true;

    await Promise.all(
      [
        this.singleton,
        this.perContainer,
        this.perResolution,
        this.transient
      ].map(manager => manager[Symbol.asyncDispose]())
    );
  }
}

export default LifecycleManagers;

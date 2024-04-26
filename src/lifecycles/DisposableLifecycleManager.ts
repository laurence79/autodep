import DisposableOnce from '../common/DisposableOnce';
import tryDisposeItem from '../common/tryDisposeItem';

class DisposableLifecycleManager extends DisposableOnce {
  private readonly disposables = new Set<
    WeakRef<Disposable | AsyncDisposable>
  >();

  protected addDisposable(instance: Disposable | AsyncDisposable) {
    this.disposables.add(new WeakRef(instance));
  }

  protected async dispose(): Promise<void> {
    await Promise.all(
      [...this.disposables.values()].map(async ref => {
        const obj = ref.deref();
        if (obj) {
          await tryDisposeItem(obj);
        }
      })
    );

    this.disposables.clear();
  }
}

export default DisposableLifecycleManager;

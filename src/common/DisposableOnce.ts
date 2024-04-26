abstract class DisposableOnce implements AsyncDisposable {
  private _disposed = false;

  public get disposed() {
    return this._disposed;
  }

  protected throwIfDisposed() {
    if (this._disposed) {
      throw new Error(`Can not use a disposed instance.`);
    }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    this.throwIfDisposed();

    this._disposed = true;

    await this.dispose();
  }

  protected abstract dispose(): Promise<void>;
}

export default DisposableOnce;

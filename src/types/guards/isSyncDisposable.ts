const isSyncDisposable = (obj: unknown): obj is Disposable => {
  return !!obj && typeof obj === 'object' && Symbol.dispose in obj;
};

export default isSyncDisposable;

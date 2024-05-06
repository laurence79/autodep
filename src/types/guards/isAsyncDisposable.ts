const isAsyncDisposable = (obj: unknown): obj is AsyncDisposable => {
  return !!obj && typeof obj === 'object' && Symbol.asyncDispose in obj;
};

export default isAsyncDisposable;

import isAsyncDisposable from './isAsyncDisposable';
import isSyncDisposable from './isSyncDisposable';

export const isDisposable = (
  obj: unknown
): obj is Disposable | AsyncDisposable =>
  isSyncDisposable(obj) || isAsyncDisposable(obj);

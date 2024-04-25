import isAsyncDisposable from './isAsyncDisposable';
import isSyncDisposable from './isSyncDisposable';

const tryDisposeItem = async (item: unknown) => {
  if (isAsyncDisposable(item)) {
    await item[Symbol.asyncDispose]();
  }
  if (isSyncDisposable(item)) {
    item[Symbol.dispose]();
  }
};

export default tryDisposeItem;

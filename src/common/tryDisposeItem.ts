import isAsyncDisposable from '../types/guards/isAsyncDisposable';
import isSyncDisposable from '../types/guards/isSyncDisposable';

const tryDisposeItem = async (item: unknown) => {
  if (isAsyncDisposable(item)) {
    await item[Symbol.asyncDispose]();
  }
  if (isSyncDisposable(item)) {
    item[Symbol.dispose]();
  }
};

export default tryDisposeItem;

import type { Constructor } from './Constructor';

export type Token<T = unknown> = Constructor<T> | object;

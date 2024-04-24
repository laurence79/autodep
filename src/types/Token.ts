/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Constructor } from './Constructor';

export type Token<T = any> = Constructor<T> | object;

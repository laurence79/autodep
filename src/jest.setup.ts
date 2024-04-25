import 'reflect-metadata';

// Until native support lands in jest 30
// https://github.com/jestjs/jest/issues/14874

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

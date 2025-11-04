import { Buffer } from "safe-buffer";

type PolyfilledGlobal = typeof globalThis & {
  global?: typeof globalThis;
  Buffer?: typeof Buffer;
  process?: {
    env: Record<string, string>;
    nextTick: (cb: (...args: unknown[]) => void, ...args: unknown[]) => void;
  };
};

const globalObject = globalThis as PolyfilledGlobal;

if (typeof globalObject.global === "undefined") {
  globalObject.global = globalObject;
}

if (typeof globalObject.Buffer === "undefined") {
  globalObject.Buffer = Buffer;
}

if (typeof globalObject.process === "undefined") {
  globalObject.process = {
    env: {},
    nextTick: (cb: (...args: unknown[]) => void, ...args: unknown[]) => queueMicrotask(() => cb(...args)),
  };
}

import { Buffer } from "safe-buffer";

if (typeof globalThis.global === "undefined") {
  (globalThis as any).global = globalThis;
}

if (typeof globalThis.Buffer === "undefined") {
  (globalThis as any).Buffer = Buffer;
}

if (typeof globalThis.process === "undefined") {
  (globalThis as any).process = {
    env: {},
    nextTick: (cb: (...args: any[]) => void, ...args: any[]) => queueMicrotask(() => cb(...args)),
  };
}

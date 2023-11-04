import * as darwin from "./darwin.ts";
import * as linux from "./linux.ts";
import * as windows from "./windows.ts";

export type Clipboard = {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
  readImage(): Promise<Uint8Array>;
  writeImage(data: Uint8Array): Promise<void>;
};

const unsupportedError = () => {
  throw new Error("unsupported os");
};

const unsupported = {
  readText: unsupportedError,
  writeText: unsupportedError,
  readImage: unsupportedError,
  writeImage: unsupportedError,
};

export const clipboard: Clipboard = (() => {
  switch (Deno.build.os) {
    case "darwin":
      return darwin;
    case "windows":
      return windows;
    case "linux":
      return linux;
    default:
      return unsupported;
  }
})();

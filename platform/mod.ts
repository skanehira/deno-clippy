import * as darwin from "./darwin.ts";
import * as linux from "./linux.ts";
import * as windows from "./windows.ts";

export type Clipboard = {
  read_text(): Promise<string>;
  write_text(text: string): Promise<void>;
  read_image(): Promise<Deno.Reader>;
  write_image(data: Uint8Array): Promise<void>;
};

const unsupportedError = () => {
  throw new Error("unsupported os");
};

const unsupported = {
  read_text: unsupportedError,
  write_text: unsupportedError,
  read_image: unsupportedError,
  write_image: unsupportedError,
};

export const clipboard = (() => {
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

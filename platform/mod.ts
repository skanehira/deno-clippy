import * as darwin from "./darwin.ts";
import * as linux from "./linux.ts";
import * as windows from "./windows.ts";

export type Clipboard = {
  read_text(): Promise<string>;
  write_text(text: string): Promise<void>;
  read_image(): Promise<Deno.Reader>;
  write_image(data: Uint8Array): Promise<void>;
};

const unsupported = () => {
  throw new Error("unsupported os");
};

let clipboard: Clipboard = {
  read_text: unsupported,
  write_text: unsupported,
  read_image: unsupported,
  write_image: unsupported,
};

switch (Deno.build.os) {
  case "darwin":
    clipboard = darwin;
    break;
  case "windows":
    clipboard = windows;
    break;
  case "linux":
    clipboard = linux;
    break;
}

export { clipboard };

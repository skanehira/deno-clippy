import { base64 } from "./deps.ts";
import {
  get_image,
  get_text,
  set_image,
  set_text,
} from "./bindings/bindings.ts";
import { clipboard as fallback } from "./platform/mod.ts";

const isError = (x: unknown): x is { Error: { error: string } } => {
  return typeof x == "object" && "Error" in (x as Record<string, unknown>);
};

/**
 * Read text from clipboard.
 */
export function readText(): Promise<string> {
  // TODO: Always fallback as it doesn't currently work on Linux
  // See #2
  if (Deno.build.os == "linux") {
    return fallback.readText();
  }
  const result = get_text();
  if (isError(result)) {
    return fallback.readText();
  }
  return Promise.resolve(result.Ok.data!);
}

/**
 * Write text to clipboard.
 */
export function writeText(text: string): Promise<void> {
  if (Deno.build.os == "linux") {
    return fallback.writeText(text);
  }
  const result = set_text(text);
  if (isError(result)) {
    return fallback.writeText(text);
  }
  return Promise.resolve();
}

/**
 * Read image from clipboard.
 */
export function readImage(): Promise<Uint8Array> {
  if (Deno.build.os == "linux") {
    return fallback.readImage();
  }
  const result = get_image();
  if (isError(result)) {
    return fallback.readImage();
  }
  return Promise.resolve(base64.decodeBase64(result.Ok.data!));
}

/**
 * Write image to clipboard.
 */
export function writeImage(data: Uint8Array): Promise<void> {
  if (Deno.build.os == "linux") {
    return fallback.writeImage(data);
  }
  const result = set_image(data);
  if (isError(result)) {
    return fallback.writeImage(data);
  }
  return Promise.resolve();
}

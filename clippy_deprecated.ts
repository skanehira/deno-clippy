import { Buffer, readAll } from "./deps_deprecated.ts";
import { readImage, readText, writeImage, writeText } from "./clippy.ts";

/**
 * Read text from clipboard.
 *
 * @deprecated Use `readText` instead.
 */
export function read_text(): Promise<string> {
  return readText();
}

/**
 * Write text to clipboard.
 *
 * @deprecated Use `writeText` instead.
 */
export function write_text(text: string): Promise<void> {
  return writeText(text);
}

/**
 * Read image from clipboard.
 *
 * @deprecated Use `readImage` instead.
 */
export async function read_image(): Promise<Deno.Reader> {
  const data = await readImage();
  return new Buffer(data);
}

/**
 * Write image to clipboard.
 *
 * @deprecated Use `writeImage` instead.
 */
export async function write_image(r: Deno.Reader): Promise<void> {
  const data = await readAll(r);
  return writeImage(data);
}

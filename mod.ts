import { base64, io, readAll } from "./deps.ts";
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

export async function read_text(): Promise<string> {
  // TODO: Always fallback as it doesn't currently work on Linux
  // See #2
  if (Deno.build.os == "linux") {
    return await fallback.read_text();
  }
  const result = get_text();
  if (isError(result)) {
    return await fallback.read_text();
  }
  return await Promise.resolve(result.Ok.data!);
}

export async function write_text(text: string): Promise<void> {
  if (Deno.build.os == "linux") {
    return await fallback.write_text(text);
  }
  const result = set_text(text);
  if (isError(result)) {
    return await fallback.write_text(text);
  }
  await Promise.resolve();
}

export async function read_image(): Promise<Deno.Reader> {
  if (Deno.build.os == "linux") {
    return await fallback.read_image();
  }
  const result = get_image();
  if (isError(result)) {
    return await fallback.read_image();
  }
  const data = base64.decodeBase64(result.Ok.data!);
  const buffer = new io.Buffer();
  await buffer.write(data);
  return buffer;
}

export async function write_image(r: Deno.Reader): Promise<void> {
  const data = await readAll(r);
  if (Deno.build.os == "linux") {
    return await fallback.write_image(data);
  }
  const result = set_image(data);
  if (isError(result)) {
    await fallback.write_image(data);
  }
}

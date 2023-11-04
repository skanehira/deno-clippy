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
    return await fallback.readText();
  }
  const result = get_text();
  if (isError(result)) {
    return await fallback.readText();
  }
  return await Promise.resolve(result.Ok.data!);
}

export async function write_text(text: string): Promise<void> {
  if (Deno.build.os == "linux") {
    return await fallback.writeText(text);
  }
  const result = set_text(text);
  if (isError(result)) {
    return await fallback.writeText(text);
  }
  await Promise.resolve();
}

export async function read_image(): Promise<Deno.Reader> {
  let data: Uint8Array;
  if (Deno.build.os == "linux") {
    data = await fallback.readImage();
  } else {
    const result = get_image();
    data = isError(result)
      ? await fallback.readImage()
      : base64.decodeBase64(result.Ok.data!);
  }
  const buffer = new io.Buffer();
  await buffer.write(data);
  return buffer;
}

export async function write_image(r: Deno.Reader): Promise<void> {
  const data = await readAll(r);
  if (Deno.build.os == "linux") {
    return await fallback.writeImage(data);
  }
  const result = set_image(data);
  if (isError(result)) {
    await fallback.writeImage(data);
  }
}

import { base64, io, readAll } from "./deps.ts";
import {
  get_image,
  get_text,
  set_image,
  set_text,
} from "./bindings/bindings.ts";

const isError = (x: unknown): x is { Error: { error: string } } => {
  return "Error" in (x as Record<string, unknown>);
};

export async function read_text(): Promise<string> {
  const result = get_text();
  if (isError(result)) {
    throw new Error(result.Error.error);
  }
  return await Promise.resolve(result.Ok.data!);
}

export async function write_text(text: string): Promise<void> {
  const result = set_text(text);
  if (isError(result)) {
    throw new Error(result.Error.error);
  }
  await Promise.resolve();
}

export async function read_image(): Promise<Deno.Reader> {
  const result = get_image();
  if (isError(result)) {
    throw new Error(result.Error.error);
  }
  const data = base64.decode(result.Ok.data!);
  const buffer = new io.Buffer();
  await buffer.write(data);
  return buffer;
}

export async function write_image(r: Deno.Reader): Promise<void> {
  const data = await readAll(r);
  const result = set_image(data);
  if (isError(result)) {
    throw new Error(result.Error.error);
  }
}

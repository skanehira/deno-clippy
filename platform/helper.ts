import { streams } from "../deps.ts";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const encode = (x: string) => encoder.encode(x);
export const decode = (x: Uint8Array) => decoder.decode(x);

export async function writeTmp(src: Deno.Reader): Promise<string> {
  const tmp = await Deno.makeTempFile();
  const dst = await Deno.open(tmp, { write: true });
  await streams.copy(src, dst);
  dst.close();
  return tmp;
}

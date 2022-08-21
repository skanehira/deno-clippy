import { Buffer, streams } from "../deps.ts";
import { decode, encode } from "./helper.ts";

export async function read_text(): Promise<string> {
  const p = Deno.run({
    cmd: ["xclip", "-selection", "clipboard", "-o"],
    stdout: "piped",
    stderr: "piped",
  });

  try {
    const status = await p.status();
    if (!status.success) {
      p.stdout.close();
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot read text: exit code: ${status.code}, error: ${cause}`
      );
    }
    p.stderr.close();
    return decode(await p.output());
  } finally {
    p.close();
  }
}

export async function write_text(text: string): Promise<void> {
  const p = Deno.run({
    cmd: ["xclip", "-selection", "clipboard"],
    stdin: "piped",
    stderr: "piped",
  });

  const buf = new Buffer(encode(text));
  await streams.copy(buf, p.stdin);

  p.stdin.close();

  try {
    const status = await p.status();
    if (!status.success) {
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot write text: exit code: ${status.code}, error: ${cause}`
      );
    }
    p.stderr.close();
  } finally {
    p.close();
  }
}

export async function read_image(): Promise<Deno.Reader> {
  const p = Deno.run({
    cmd: ["xclip", "-selection", "clipboard", "-t", "image/png", "-o"],
    stdout: "piped",
    stderr: "piped",
  });

  const dst = new Buffer();
  await streams.copy(p.stdout, dst);
  p.stdout.close();

  try {
    const status = await p.status();
    if (!status.success) {
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot read image: exit code: ${status.code}, error: ${cause}`
      );
    }
    p.stderr.close();

    return dst;
  } finally {
    p.close();
  }
}

export async function write_image(data: Uint8Array): Promise<void> {
  const p = Deno.run({
    cmd: ["xclip", "-selection", "clipboard", "-t", "image/png"],
    stderr: "piped",
    stdin: "piped",
  });

  await streams.copy(new Buffer(data), p.stdin);
  p.stdin.close();

  try {
    const status = await p.status();
    if (!status.success) {
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot write image: exit code: ${status.code}, error: ${cause}`
      );
    }
    p.stderr.close();
  } finally {
    p.close();
  }
}

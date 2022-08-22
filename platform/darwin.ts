import { Buffer, streams } from "../deps.ts";
import { decode, encode, writeTmp } from "./helper.ts";

export async function read_text(): Promise<string> {
  const p = Deno.run({
    cmd: ["pbpaste"],
    stdout: "piped",
    stderr: "piped",
  });

  try {
    const status = await p.status();
    if (!status.success) {
      p.stdout.close();
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot read text: exit code: ${status.code}, error: ${cause}`,
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
    cmd: ["pbcopy"],
    stdin: "piped",
    stderr: "piped",
    stdout: "null",
  });

  const buf = new Buffer(encode(text));
  await streams.copy(buf, p.stdin);

  p.stdin.close();

  try {
    const status = await p.status();
    if (!status.success) {
      throw new Error(decode(await p.stderrOutput()));
    }
    p.stderr.close();
  } finally {
    p.close();
  }
}

export async function read_image(): Promise<Deno.Reader> {
  const tmp = await Deno.makeTempFile();
  const p = Deno.run({
    cmd: [
      "osascript",
      "-e",
      `write (the clipboard as «class PNGf») to (open for access "${tmp}" with write permission)`,
    ],
    stderr: "piped",
  });

  try {
    const status = await p.status();
    if (!status.success) {
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot read text: exit code: ${status.code}, error: ${cause}`,
      );
    }
    p.stderr.close();

    const dst = new Buffer();
    const src = await Deno.open(tmp);
    await streams.copy(src, dst);
    src.close();
    return dst;
  } finally {
    p.close();
  }
}

export async function write_image(data: Uint8Array): Promise<void> {
  const tmp = await writeTmp(new Buffer(data));
  const p = Deno.run({
    cmd: [
      "osascript",
      "-e",
      `set the clipboard to (read "${tmp}" as TIFF picture)`,
    ],
    stderr: "piped",
  });

  try {
    const status = await p.status();
    if (!status.success) {
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot read text: exit code: ${status.code}, error: ${cause}`,
      );
    }
    p.stderr.close();
  } finally {
    p.close();
  }
}

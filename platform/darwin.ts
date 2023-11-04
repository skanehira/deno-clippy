import { decode } from "./helper.ts";

export async function readText(): Promise<string> {
  const cmd = new Deno.Command("pbpaste", {
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
  const { success, code, stdout, stderr } = await cmd.output();
  if (!success) {
    const cause = decode(stderr);
    throw new Error(
      `cannot read text: exit code: ${code}, error: ${cause}`,
    );
  }
  return decode(stdout);
}

export async function writeText(text: string): Promise<void> {
  const cmd = new Deno.Command("pbcopy", {
    stdin: "piped",
    stderr: "piped",
    stdout: "null",
  });
  const child = cmd.spawn();

  const r = new Blob([text]).stream();
  await r.pipeTo(child.stdin);

  const { success, code, stderr } = await child.output();
  if (!success) {
    const cause = decode(stderr);
    throw new Error(
      `cannot write text: exit code: ${code}, error: ${cause}`,
    );
  }
}

export async function readImage(): Promise<Uint8Array> {
  const tmp = await Deno.makeTempFile();
  try {
    const cmd = new Deno.Command("osascript", {
      args: [
        "-e",
        `write (the clipboard as «class PNGf») to (open for access "${tmp}" with write permission)`,
      ],
      stdin: "null",
      stdout: "null",
      stderr: "piped",
    });
    const { success, code, stderr } = await cmd.output();
    if (!success) {
      const cause = decode(stderr);
      throw new Error(
        `cannot read image: exit code: ${code}, error: ${cause}`,
      );
    }
    return await Deno.readFile(tmp);
  } finally {
    await Deno.remove(tmp);
  }
}

export async function writeImage(data: Uint8Array): Promise<void> {
  const tmp = await Deno.makeTempFile();
  try {
    const file = await Deno.open(tmp, { write: true });
    await ReadableStream.from([data]).pipeTo(file.writable);
    const cmd = new Deno.Command("osascript", {
      args: [
        "-e",
        `set the clipboard to (read "${tmp}" as TIFF picture)`,
      ],
      stdin: "null",
      stdout: "null",
      stderr: "piped",
    });
    const { success, code, stderr } = await cmd.output();
    if (!success) {
      const cause = decode(stderr);
      throw new Error(
        `cannot write image: exit code: ${code}, error: ${cause}`,
      );
    }
  } finally {
    await Deno.remove(tmp);
  }
}

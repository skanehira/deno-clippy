import { toText } from "../deps.ts";
import { decode } from "./helper.ts";

export async function readText(): Promise<string> {
  const cmd = new Deno.Command("xclip", {
    args: ["-selection", "clipboard", "-o"],
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
  const cmd = new Deno.Command("xclip", {
    args: ["-selection", "clipboard"],
    stdin: "piped",
    stderr: "piped",
    stdout: "null",
  });
  const child = cmd.spawn();

  const r = new Blob([text]).stream();
  await r.pipeTo(child.stdin);

  // It seems we must not wait `stderr` unless there are actual errors.
  // Thus we cannot use `await child.output()` here.
  const { success, code } = await child.status;
  if (!success) {
    const cause = await toText(child.stderr);
    throw new Error(
      `cannot write text: exit code: ${code}, error: ${cause}`,
    );
  }
  await child.stderr.cancel();
}

export async function readImage(): Promise<Uint8Array> {
  const cmd = new Deno.Command("xclip", {
    args: ["-selection", "clipboard", "-t", "image/png", "-o"],
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
  const { success, code, stdout, stderr } = await cmd.output();
  if (!success) {
    const cause = decode(stderr);
    throw new Error(
      `cannot read image: exit code: ${code}, error: ${cause}`,
    );
  }
  return stdout;
}

export async function writeImage(data: Uint8Array): Promise<void> {
  const cmd = new Deno.Command("xclip", {
    args: ["-selection", "clipboard", "-t", "image/png"],
    stdin: "piped",
    stderr: "piped",
    stdout: "null",
  });
  const child = cmd.spawn();

  const r = new Blob([data]).stream();
  await r.pipeTo(child.stdin);

  // It seems we must not wait `stderr` unless there are actual errors.
  // Thus we cannot use `await child.output()` here.
  const { success, code } = await child.status;
  if (!success) {
    const cause = await toText(child.stderr);
    throw new Error(
      `cannot write image: exit code: ${code}, error: ${cause}`,
    );
  }
  await child.stderr.cancel();
}

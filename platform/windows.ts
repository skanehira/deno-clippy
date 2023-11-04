import { readerFromStreamReader } from "../deps.ts";
import { decode } from "./helper.ts";

export async function read_text(): Promise<string> {
  const cmd = new Deno.Command("powershell", {
    args: ["-noprofile", "-command", "Get-Clipboard"],
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
  const { success, code, stderr, stdout } = await cmd.output();
  if (!success) {
    const cause = decode(stderr);
    throw new Error(
      `failed to read text: exit code: ${code}, error: ${cause}`,
    );
  }
  // XXX:
  // I don't think it's a good idea to remove a newline...
  // Shall we remove only the trailing one?
  return decode(stdout).replace(/\r?\n/, "");
}

export async function write_text(text: string): Promise<void> {
  const cmd = new Deno.Command("powershell", {
    args: ["-noprofile", "-command", "$input|Set-Clipboard"],
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
      `failed to write text: exit code: ${code}, error: ${cause}`,
    );
  }
}

export async function read_image(): Promise<Deno.Reader> {
  const tmp = await Deno.makeTempFile();
  try {
    const cmd = new Deno.Command("powershell", {
      args: [
        "-noprofile",
        "-command",
        "Add-Type",
        "-assemblyname",
        `System.Windows.Forms;$clip=[Windows.Forms.Clipboard]::GetImage();if ($clip -ne $null) { $clip.Save('${tmp}') };`,
      ],
      stdin: "null",
      stdout: "null",
      stderr: "piped",
    });
    const { success, code, stderr } = await cmd.output();
    if (!success) {
      const cause = decode(stderr);
      throw new Error(
        `failed to read image: exit code: ${code}, error: ${cause}`,
      );
    }
    const file = await Deno.open(tmp);
    return readerFromStreamReader(file.readable.getReader());
  } finally {
    await Deno.remove(tmp);
  }
}

export async function write_image(data: Uint8Array): Promise<void> {
  const tmp = await Deno.makeTempFile();
  try {
    const file = await Deno.open(tmp, { write: true });
    await ReadableStream.from([data]).pipeTo(file.writable);
    const cmd = new Deno.Command("powershell", {
      args: [
        "-noprofile",
        "-command",
        "Add-Type",
        "-assemblyname",
        `System.Windows.Forms;[Windows.Forms.Clipboard]::SetImage([System.Drawing.Image]::FromFile('${tmp}'));`,
      ],
      stdin: "null",
      stdout: "null",
      stderr: "piped",
    });
    const { success, code, stderr } = await cmd.output();
    if (!success) {
      const cause = decode(stderr);
      throw new Error(
        `failed to write image: exit code: ${code}, error: ${cause}`,
      );
    }
  } finally {
    await Deno.remove(tmp);
  }
}

import { decode } from "./helper.ts";

export async function readText(): Promise<string> {
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
  // Remove trailing CRLF while powershell automatically adds it.
  return decode(stdout).replace(/\r\n$/, "");
}

export async function writeText(text: string): Promise<void> {
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

export async function readImage(): Promise<Uint8Array> {
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

import { Buffer, copy } from "../deps.ts";
import { decode, encode, writeTmp } from "./helper.ts";

export async function read_text(): Promise<string> {
  const p = Deno.run({
    cmd: ["powershell", "-noprofile", "-command", "Get-Clipboard"],
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
    return decode(await p.output()).replace(/\r?\n/, "");
  } finally {
    p.close();
  }
}

export async function write_text(text: string): Promise<void> {
  const p = Deno.run({
    cmd: ["powershell", "-noprofile", "-command", "$input|Set-Clipboard"],
    stdin: "piped",
    stderr: "piped",
  });

  const buf = new Buffer(encode(text));
  await copy(buf, p.stdin);

  p.stdin.close();

  try {
    const status = await p.status();
    if (!status.success) {
      const cause = decode(await p.stderrOutput());
      throw new Error(
        `cannot write text: exit code: ${status.code}, error: ${cause}`,
      );
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
      "PowerShell",
      "-Command",
      "Add-Type",
      "-AssemblyName",
      `System.Windows.Forms;$clip=[Windows.Forms.Clipboard]::GetImage();if ($clip -ne $null) { $clip.Save('${tmp}') };`,
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
    await copy(src, dst);
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
      "PowerShell",
      "-Command",
      "Add-Type",
      "-AssemblyName",
      `System.Windows.Forms;[Windows.Forms.Clipboard]::SetImage([System.Drawing.Image]::FromFile('${tmp}'));`,
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

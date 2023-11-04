import { assertEquals } from "../deps_test.ts";
import { path } from "../deps.ts";
import { clipboard } from "./mod.ts";

Deno.test("read write text", async () => {
  const text = "hello clippy";
  await clipboard.writeText(text);
  const got = await clipboard.readText();
  assertEquals(got, text);
});

Deno.test("read write image", async () => {
  const file = path.join("testdata", "out.png");
  const data = await Deno.readFile(file);
  await clipboard.writeImage(data);

  const result = await clipboard.readImage();
  const header = result.slice(0, 8);
  const pngHeader = new Uint8Array([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
  ]);
  assertEquals(header, pngHeader);
});

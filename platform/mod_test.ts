import { assertEquals } from "../deps_test.ts";
import { path } from "../deps.ts";
import { clipboard } from "./mod.ts";

Deno.test("read write text", async (t) => {
  await t.step("single line", async () => {
    const text = "hello clippy";
    await clipboard.writeText(text);
    const got = await clipboard.readText();
    assertEquals(got, text);
  });

  await t.step("multiline (\\n)", async () => {
    const text = "hello\nclippy";
    await clipboard.writeText(text);
    const got = await clipboard.readText();
    assertEquals(got, text);
  });

  await t.step("multiline (\\r\\n)", async () => {
    const text = "hello\r\nclippy";
    await clipboard.writeText(text);
    const got = await clipboard.readText();
    assertEquals(got, text);
  });
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

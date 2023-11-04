import { assertEquals } from "./deps_test.ts";
import { path } from "./deps.ts";
import { readImage, readText, writeImage, writeText } from "./clippy.ts";
import { clipboard as fallback } from "./platform/mod.ts";

function assertImage(data: Uint8Array) {
  const header = data.slice(0, 8);
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
}

Deno.test("image: write to/read from clipboard", async (t) => {
  await t.step("write", async () => {
    const data = await Deno.readFile(path.join("testdata", "out.png"));
    await writeImage(data);
  });

  await t.step("read", async () => {
    const got = await readImage();
    assertImage(got);
  });
});

Deno.test("text: write to/read from clipboard", async (t) => {
  const text = "hello world";
  await t.step("write", async () => {
    await writeText(text);
  });
  await t.step("read", async () => {
    const got = await readText();
    assertEquals(got, text);
  });
});

Deno.test("check compatibility between fallback functions and dylib functions", async (t) => {
  await t.step({
    name: "text: write: fallback, read: dylib",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const text = "hello clippy";
      await fallback.writeText(text);
      const got = await readText();
      assertEquals(got, text);
    },
  });

  await t.step({
    name: "text: write: dylib, read: fallback",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const text = "hello clippy";
      await writeText(text);
      const got = await fallback.readText();
      assertEquals(got, text);
    },
  });

  await t.step({
    name: "iamge: write: fallback, read: dylib",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const data = await Deno.readFile(path.join("testdata", "out.png"));
      await fallback.writeImage(data);
      const got = await readImage();
      assertImage(got);
    },
  });

  await t.step({
    name: "image write: dylib, read: fallback",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const data = await Deno.readFile(path.join("testdata", "out.png"));
      await writeImage(data);
      const got = await fallback.readImage();
      assertImage(got);
    },
  });
});

import { assertEquals } from "./deps_test.ts";
import { path } from "./deps.ts";
import { readAll } from "./deps_deprecated.ts";
import { clipboard as fallback } from "./platform/mod.ts";
import {
  read_image,
  read_text,
  write_image,
  write_text,
} from "./clippy_deprecated.ts";

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
    const file = path.join("testdata", "out.png");
    const f = await Deno.open(file);
    await write_image(f);
    f.close();
  });

  await t.step("read", async () => {
    const got = await readAll(await read_image());
    assertImage(got);
  });
});

Deno.test("text: write to/read from clipboard", async (t) => {
  const text = "hello world";
  await t.step("write", async () => {
    await write_text(text);
  });
  await t.step("read", async () => {
    const got = await read_text();
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
      const got = await read_text();
      assertEquals(got, text);
    },
  });

  await t.step({
    name: "text: write: dylib, read: fallback",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const text = "hello clippy";
      await write_text(text);
      const got = await fallback.readText();
      assertEquals(got, text);
    },
  });

  await t.step({
    name: "iamge: write: fallback, read: dylib",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const file = path.join("testdata", "out.png");
      const f = await Deno.open(file);
      await fallback.writeImage(await readAll(f));
      f.close();
      const got = await readAll(await read_image());
      assertImage(got);
    },
  });

  await t.step({
    name: "image write: dylib, read: fallback",
    ignore: Deno.build.os == "linux",
    fn: async () => {
      const file = path.join("testdata", "out.png");
      const f = await Deno.open(file);
      await write_image(f);
      f.close();
      const got = await fallback.readImage();
      assertImage(got);
    },
  });
});

import { read_image, read_text, write_image, write_text } from "./mod.ts";
import { assertEquals, path, readAll } from "./deps.ts";

Deno.test("image: write to/read from clipboard", async () => {
  const file = path.join("testdata", "out.png");
  const f = await Deno.open(file);
  await write_image(f);
  f.close();
  const got = await readAll(await read_image());
  const want = await Deno.readFile(file);
  assertEquals(got, want);
});

Deno.test("text: write to/read from clipboard", async () => {
  const text = "hello world";
  await write_text(text);
  const got = await read_text();
  assertEquals(got, text);
});

import * as clippy from "https://deno.land/x/clippy@v0.1.0/mod.ts";
import { readAll } from "https://deno.land/std@0.152.0/streams/conversion.ts";

// write image to clipboard
const f = await Deno.open("../testdata/out.png");
await clippy.write_image(f);
f.close();

// read image from clipboard
const r = await clippy.read_image();
const data = await readAll(r);
await Deno.writeFile("example.png", data);

// write text to clipboard
await clippy.write_text("hello clippy");

// read text from clipboard
const text = await clippy.read_text();
console.log(text);

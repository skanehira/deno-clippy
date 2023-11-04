import * as clippy from "../mod.ts";

// write image to clipboard
const data1 = await Deno.readFile("../testdata/out.png");
await clippy.writeImage(data1);

// read image from clipboard
const data2 = await clippy.readImage();
await Deno.writeFile("example.png", data2);

// write text to clipboard
await clippy.writeText("hello clippy");

// read text from clipboard
const text = await clippy.readText();
console.log(text);

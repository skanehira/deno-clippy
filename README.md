# deno-clippy

<img src="./logo.svg" alt="deno-clippy logo" width="200" height="200" />

This is cross-platform Deno library for writing and reading clipboard.\
You can read from/write image and text.

This library uses Rust's [arboard](https://github.com/1Password/arboard) through
[FFI](https://deno.land/manual@v1.24.3/runtime/ffi_api).\
Therefore, it is basically not necessary to prepare some external commands when
using this library.

However, if arboard returns an error, deno-clippy will fall back and use an
external command (for example, `xclip` on Linux).\
If arboard does not work properly and an error occurs, installing the external
command may work.

## Known issue.

Currently, arboard is not work on Linux.\
So, please install `xclip` when you using library on Linux.

## Support Version

| `deno-clippy` | `Deno`               |
| ------------- | -------------------- |
| v0.1.0        | `v1.24.3` or earlier |
| v0.2.0        | `v1.25.0` or later   |
| v0.2.1 ~      | `v1.32.4` or later   |

## Example

```typescript
import * as clippy from "https://deno.land/x/clippy/mod.ts";

// write image to clipboard
const data1 = await Deno.readFile("testdata/out.png");
await clippy.writeImage(data1);

// read image from clipboard
const data2 = await clippy.readImage();
await Deno.writeFile("example.png", data2);

// write text to clipboard
await clippy.writeText("hello clippy");

// read text from clipboard
const text = await clippy.readText();
console.log(text);
```

Run script:

```sh
# You have to use `--unstable` because FFI is not stable.
deno run -A --unstable sample.ts
```

## Contribution

Any contribution including documentations are welcome.

## Development

To develop this library, the following must be installed.

- Rust
- Deno(`v1.32.4` or later)
- [deno_bindgen](https://github.com/denoland/deno_bindgen)
- xclip(on Linux)
- make

If you modify the Rust code (under `src/`), you need to generate
`bindings/bindings.ts` using `deno_bindgen`(just run `make build`).\
`bindings.ts` is the glue code to handle `dylib` from Deno, and basically should
not be edited and committed.\
`bindings.ts` will only be changed for new releases as follows when execute
`VERSION=v0.1.0 make build`.

```diff
 const url = new URL(
-  "https://github.com/skanehira/deno-clippy/releases/download/v0.0.1/",
+  "https://github.com/skanehira/deno-clippy/releases/download/v0.1.0/",
   import.meta.url,
 )
 let uri = url.toString()
```

After implementation is complete, be sure to write tests as well.\
The tests are to ensure the quality of this library.

The following is how to run the test.

```sh
# clean up dylib cache, and generate bindings.ts, dylib and run deno's test.
$ make deno-test
# run rust's tests.
$ make ffi-test
# run deno-test and ffi-test
$ make test
```

## Author

skanehira

The logo was designed by @hashrock, licensed under CC BY-NC-ND 4.0.

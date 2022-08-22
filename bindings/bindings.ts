// Auto-generated with deno_bindgen
import { CachePolicy, prepare } from "https://deno.land/x/plug@0.5.2/plug.ts"

function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v
  return new TextEncoder().encode(v)
}

function decode(v: Uint8Array): string {
  return new TextDecoder().decode(v)
}

function readPointer(v: any): Uint8Array {
  const ptr = new Deno.UnsafePointerView(v as bigint)
  const lengthBe = new Uint8Array(4)
  const view = new DataView(lengthBe.buffer)
  ptr.copyInto(lengthBe, 0)
  const buf = new Uint8Array(view.getUint32(0))
  ptr.copyInto(buf, 4)
  return buf
}

const url = new URL(
  "https://github.com/skanehira/deno-clippy/releases/download/v0.1.0/",
  import.meta.url,
)
let uri = url.toString()
if (!uri.endsWith("/")) uri += "/"

let darwin: string | { aarch64: string; x86_64: string } = uri
  + "libdeno_clippy.dylib"

if (url.protocol !== "file:") {
  // Assume that remote assets follow naming scheme
  // for each macOS artifact.
  darwin = {
    aarch64: uri + "libdeno_clippy_arm64.dylib",
    x86_64: uri + "libdeno_clippy.dylib",
  }
}

const opts = {
  name: "deno_clippy",
  urls: {
    darwin,
    windows: uri + "deno_clippy.dll",
    linux: uri + "libdeno_clippy.so",
  },
  policy: undefined,
}
const _lib = await prepare(opts, {
  get_image: { parameters: [], result: "pointer", nonblocking: false },
  get_text: { parameters: [], result: "pointer", nonblocking: false },
  set_image: {
    parameters: ["pointer", "usize"],
    result: "pointer",
    nonblocking: false,
  },
  set_text: {
    parameters: ["pointer", "usize"],
    result: "pointer",
    nonblocking: false,
  },
})
export type ClipboardResult =
  | {
    Ok: {
      data: string | undefined | null
    }
  }
  | {
    Error: {
      error: string
    }
  }
export function get_image() {
  let rawResult = _lib.symbols.get_image()
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}
export function get_text() {
  let rawResult = _lib.symbols.get_text()
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}
export function set_image(a0: Uint8Array) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.set_image(a0_buf, a0_buf.byteLength)
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}
export function set_text(a0: string) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.set_text(a0_buf, a0_buf.byteLength)
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}

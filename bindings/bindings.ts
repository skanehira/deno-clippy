// Auto-generated with deno_bindgen
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v
  return new TextEncoder().encode(v)
}

function decode(v: Uint8Array): string {
  return new TextDecoder().decode(v)
}

// deno-lint-ignore no-explicit-any
function readPointer(v: any): Uint8Array {
  const ptr = new Deno.UnsafePointerView(v)
  const lengthBe = new Uint8Array(4)
  const view = new DataView(lengthBe.buffer)
  ptr.copyInto(lengthBe, 0)
  const buf = new Uint8Array(view.getUint32(0))
  ptr.copyInto(buf, 4)
  return buf
}

const url = new URL(
  "https://github.com/skanehira/deno-clippy/releases/download/v1.0.0/",
  import.meta.url,
)

import { dlopen, FetchOptions } from "https://deno.land/x/plug@1.0.1/mod.ts"
let uri = url.toString()
if (!uri.endsWith("/")) uri += "/"

let darwin: string | { aarch64: string; x86_64: string } = uri

const opts: FetchOptions = {
  name: "deno_clippy",
  url: {
    darwin,
    windows: uri,
    linux: uri,
  },
  suffixes: {
    darwin: {
      aarch64: "_arm64",
    },
  },
  cache: "use",
}
const { symbols } = await dlopen(opts, {
  get_image: { parameters: [], result: "buffer", nonblocking: false },
  get_text: { parameters: [], result: "buffer", nonblocking: false },
  set_image: {
    parameters: ["buffer", "usize"],
    result: "buffer",
    nonblocking: false,
  },
  set_text: {
    parameters: ["buffer", "usize"],
    result: "buffer",
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
  const rawResult = symbols.get_image()
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}
export function get_text() {
  const rawResult = symbols.get_text()
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}
export function set_image(a0: Uint8Array) {
  const a0_buf = encode(a0)

  const rawResult = symbols.set_image(a0_buf, a0_buf.byteLength)
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}
export function set_text(a0: string) {
  const a0_buf = encode(a0)

  const rawResult = symbols.set_text(a0_buf, a0_buf.byteLength)
  const result = readPointer(rawResult)
  return JSON.parse(decode(result)) as ClipboardResult
}

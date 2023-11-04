const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const encode = (v?: string) => encoder.encode(v);
export const decode = (v?: BufferSource) => decoder.decode(v);

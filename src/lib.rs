#![allow(clippy::not_unsafe_ptr_arg_deref)]

use anyhow::{anyhow, Result};
use arboard::{Clipboard, ImageData};
use deno_bindgen::deno_bindgen;
use image::*;
use std::{borrow::Cow, io, str};

#[deno_bindgen]
pub enum ClipboardResult {
    Ok { data: Option<String> },
    Error { error: String },
}

fn inner_get_image() -> Result<String> {
    let mut clipboard = Clipboard::new()?;
    let image = clipboard.get_image()?;
    let image: RgbaImage =
        ImageBuffer::from_raw(image.width as u32, image.height as u32, image.bytes.into())
            .ok_or_else(|| anyhow!("image data size maybe too big/small"))?;
    let mut out = io::Cursor::new(Vec::new());
    image.write_to(&mut out, ImageOutputFormat::Png)?;
    let data = out.get_ref().as_bytes();
    let b64 = base64::encode(data);
    Ok(b64)
}

#[deno_bindgen]
pub fn get_image() -> ClipboardResult {
    match inner_get_image() {
        Ok(data) => ClipboardResult::Ok { data: Some(data) },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

fn inner_get_text() -> Result<String> {
    let mut clipboard = Clipboard::new()?;
    clipboard
        .get_text()
        .map_err(|x| -> anyhow::Error { anyhow!(x) })
}

#[deno_bindgen]
pub fn get_text() -> ClipboardResult {
    match inner_get_text() {
        Ok(data) => ClipboardResult::Ok { data: Some(data) },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

fn inner_set_image(data: &[u8]) -> Result<()> {
    let mut clipboard = Clipboard::new()?;
    let img = image::load_from_memory(data)?;
    let img_data = ImageData {
        width: img.width() as usize,
        height: img.height() as usize,
        bytes: Cow::from(img.into_bytes()),
    };
    clipboard
        .set_image(img_data)
        .map_err(|x| -> anyhow::Error { anyhow!(x) })
}

#[deno_bindgen]
pub fn set_image(data: &[u8]) -> ClipboardResult {
    match inner_set_image(data) {
        Ok(_) => ClipboardResult::Ok { data: None },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

pub fn inner_set_text(text: &str) -> Result<()> {
    let mut clipboard = Clipboard::new()?;
    clipboard
        .set_text(text.to_string())
        .map_err(|x| -> anyhow::Error { anyhow!(x) })
}

#[deno_bindgen]
pub fn set_text(text: &str) -> ClipboardResult {
    match inner_set_text(text) {
        Ok(_) => ClipboardResult::Ok { data: None },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

#[cfg(test)]
mod test {
    use std::{fs::File, io::Read, path::Path};

    use super::*;

    #[test]
    fn read_write_text() {
        if let Err(err) = inner_set_text("set text") {
            panic!("cannot set text: {}", err);
        };

        match inner_get_text() {
            Ok(text) => {
                assert_eq!(text, "set text")
            }
            Err(err) => {
                panic!("cannot get text: {}", err);
            }
        };
    }

    #[test]
    fn read_write_image() {
        let read_file = |path: &Path| -> Vec<u8> {
            let mut file = File::open(path).expect("cannot open file");
            let mut buffer = Vec::<u8>::new();
            file.read_to_end(&mut buffer).expect("cannot read to end");
            buffer
        };

        let path = Path::new("testdata/out.png");

        inner_set_image(read_file(path).as_slice()).expect("cannot write image");

        let buffer = read_file(path);
        let b64 = inner_get_image().expect("cannot get image");
        let bytes = base64::decode(&b64).expect("cannot decode base64");
        assert_eq!(buffer, bytes);
    }
}

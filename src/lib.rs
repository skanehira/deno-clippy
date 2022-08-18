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

#[deno_bindgen]
pub fn get_image() -> ClipboardResult {
    let f = || -> Result<String> {
        let mut clipboard = Clipboard::new()?;
        let image = clipboard.get_image()?;
        let image: RgbaImage =
            ImageBuffer::from_raw(image.width as u32, image.height as u32, image.bytes.into())
                .ok_or(anyhow!("image data size maybe too big/small"))?;
        let mut out = io::Cursor::new(Vec::new());
        image.write_to(&mut out, ImageOutputFormat::Png)?;
        let data = out.get_ref().as_bytes();
        let b64 = base64::encode(data);
        Ok(b64)
    };

    match f() {
        Ok(data) => ClipboardResult::Ok { data: Some(data) },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

#[deno_bindgen]
pub fn get_text() -> ClipboardResult {
    let f = || -> Result<String> {
        let mut clipboard = Clipboard::new()?;
        clipboard
            .get_text()
            .map_err(|x| -> anyhow::Error { anyhow!(x) })
    };
    match f() {
        Ok(data) => ClipboardResult::Ok { data: Some(data) },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

#[deno_bindgen]
pub fn set_image(data: &[u8]) -> ClipboardResult {
    let f = |data: &[u8]| -> Result<()> {
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
    };

    match f(data) {
        Ok(_) => ClipboardResult::Ok { data: None },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

#[deno_bindgen]
pub fn set_text(text: &str) -> ClipboardResult {
    let f = |text: &str| -> Result<()> {
        let mut clipboard = Clipboard::new()?;
        clipboard
            .set_text(text.to_string())
            .map_err(|x| -> anyhow::Error { anyhow!(x) })
    };
    match f(text) {
        Ok(_) => ClipboardResult::Ok { data: None },
        Err(err) => ClipboardResult::Error {
            error: err.to_string(),
        },
    }
}

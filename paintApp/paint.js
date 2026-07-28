import { paintCanvas, color } from "./enumConst.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
export const imageData = ctx.createImageData(canvas.width, canvas.height);
const pixels = imageData.data; // Array of color [R,G,B,A, R,G,B,A, ...]

const canvasPreview = document.getElementById("canvasPreview");
const ctxPreview = canvasPreview.getContext("2d");
export const imageDataPreview = ctxPreview.createImageData(
  canvasPreview.width,
  canvasPreview.height,
);
const pixelsPreview = imageDataPreview.data; // Array of color [R,G,B,A, R,G,B,A, ...]

export function putPixel(x, y, r, g, b, a = 255, isPreview = false) {
  const idx = (y * canvas.width + x) * 4;
  if (!isPreview) {
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = a;
  } else {
    pixelsPreview[idx] = r;
    pixelsPreview[idx + 1] = g;
    pixelsPreview[idx + 2] = b;
    pixelsPreview[idx + 3] = a;
  }
}

export function drawLine(
  x1,
  y1,
  x2,
  y2,
  r,
  g,
  b,
  a = 255,
  size = 0,
  isPreview = false,
) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  if (dx > dy) {
    const m = (y2 - y1) / (x2 - x1);
    const c = y1 - m * x1;
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      const y = Math.round(m * x + c);
      size === 0
        ? putPixel(x, y, r, g, b, a, isPreview)
        : drawEllipse(x, y, size, size, r, g, b, a, isPreview);
    }
  } else {
    const m = (x2 - x1) / (y2 - y1);
    const c = x1 - m * y1;
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      const x = Math.round(m * y + c);

      size === 0
        ? putPixel(x, y, r, g, b, a, isPreview)
        : drawEllipse(x, y, size, size, r, g, b, a, isPreview);
    }
  }
}

export function drawRect(
  x1,
  y1,
  x2,
  y2,
  r,
  g,
  b,
  a = 255,
  size = 1,
  isPreview = false,
) {
  drawLine(x1, y1, x2, y1, r, g, b, a, size, isPreview);
  drawLine(x2, y1, x2, y2, r, g, b, a, size, isPreview);
  drawLine(x2, y2, x1, y2, r, g, b, a, size, isPreview);
  drawLine(x1, y1, x1, y2, r, g, b, a, size, isPreview);
}

export function drawRectFilled(x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      putPixel(x, y, r, g, b, a);
    }
  }
}

export function drawRectGradient(
  x1,
  y1,
  x2,
  y2,
  r1,
  g1,
  b1,
  r2,
  g2,
  b2,
  a = 255,
) {
  for (let y = y1; y <= y2; y++) {
    let t = (y - y1) / (y2 - y1);
    let r = Math.round(r1 * (1 - t) + r2 * t);
    let g = Math.round(g1 * (1 - t) + g2 * t);
    let b = Math.round(b1 * (1 - t) + b2 * t);
    for (let x = x1; x <= x2; x++) {
      putPixel(x, y, r, g, b, a);
    }
  }
}

export function drawEllipse(
  cx,
  cy,
  rx,
  ry,
  r,
  g,
  b,
  a = 255,
  isPreview = false,
) {
  for (let y = -ry; y < ry; y++) {
    // รัสมีแกนy
    for (let x = -rx; x < rx; x++) {
      //รัสมีแกนx
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        //ตามสูตร x^2/a^2 + y^2/a^2
        putPixel(cx + x, cy + y, r, g, b, a, isPreview);
      }
    }
  }
}

export function drawSprite(sprite, x, y, r, g, b, a = 255) {
  for (let j = 0; j < sprite.length; j++) {
    for (let i = 0; i < sprite[j].length; i++) {
      if (sprite[j][i] === 1) {
        putPixel(x + i, y + j, r, g, b, a);
      }
    }
  }
}

export function drawColorSprite(sprite, x, y) {
  for (let j = 0; j < sprite.length; j++) {
    for (let i = 0; i < sprite[j].length; i++) {
      let color = sprite[j][i];
      let r3 = (color >> 5) & 0x07;
      let g3 = (color >> 2) & 0x07;
      let b2 = color & 0x03;
      let R = Math.round((r3 * 255) / 7);
      let G = Math.round((g3 * 255) / 7);
      let B = Math.round((b2 * 255) / 3);
      console.log(R, G, B);
      putPixel(x + i, y + j, R, G, B, 255);
    }
  }
}

export function drawSprites(x, y, xAmount, yAmount, r, g, b, a = 255) {
  for (let i = 0; i < xAmount; i++) {
    for (let j = 0; j < yAmount; j++) {
      drawColorSprite(spaceInvaderSprite, y + i * 10, x + j * 10, r, g, b, a);
    }
  }
}

export function clearPreview() {
  pixelsPreview.fill(0); // ล้างทุกพิกเซล (RGBA = 0)
}
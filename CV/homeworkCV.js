import {
  smileSprite24Bit,
  smileSprite24Bit32x32,
  spaceInvaderSprite,
} from "./sprite.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageData = ctx.createImageData(canvas.width, canvas.height);
const pixels = imageData.data; // Array of color [R,G,B,A, R,G,B,A, ...]

function putPixel(x, y, r, g, b, a = 255) {
  const idx = (y * canvas.width + x) * 4; // หา index แรกของ pixel (x,y)
  pixels[idx] = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
  pixels[idx + 3] = a;
}

function drawLine(x1, y1, x2, y2, r, g, b, a = 255) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  if (dx > dy) {
    const m = (y2 - y1) / (x2 - x1);
    const c = y1 - m * x1;
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      const y = Math.round(m * x + c);
      putPixel(x, y, r, g, b, a);
    }
  } else {
    const m = (x2 - x1) / (y2 - y1);
    const c = x1 - m * y1;
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      const x = Math.round(m * y + c);
      putPixel(x, y, r, g, b, a);
    }
  }
}

function drawRect(x1, y1, x2, y2, r, g, b, a = 255) {
  drawLine(x1, y1, x2, y1, r, g, b, a); // Top edge
  drawLine(x2, y1, x2, y2, r, g, b, a); // Right edge
  drawLine(x2, y2, x1, y2, r, g, b, a); // Bottom edge
  drawLine(x1, y2, x1, y1, r, g, b, a); // Left edge
}

function drawRectFilled(x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      putPixel(x, y, r, g, b, a);
    }
  }
}

function drawRectGradient(x1, y1, x2, y2, r1, g1, b1, r2, g2, b2) {
  for (let y = y1; y <= y2; y++) {
    const t = (y - y1) / (y2 - y1);
    const r = Math.round(r1 * (1 - t) + r2 * t);
    const g = Math.round(g1 * (1 - t) + g2 * t);
    const b = Math.round(b1 * (1 - t) + b2 * t);
    for (let x = x1; x <= x2; x++) {
      putPixel(x, y, r, g, b);
    }
  }
}

function drawEllipse(cx, cy, rx, ry, r, g, b, a = 255) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        putPixel(cx + x, cy + y, r, g, b, a);
      }
    }
  }
}

function drawSprite24Bit(sprite, x, y, degree, scaleX, scaleY) {
  for (let j = 0; j < sprite.length; j++) {
    for (let i = 0; i < sprite[j].length; i++) {
      const color = sprite[j][i];
      const c1X = i - sprite[j].length / 2;
      const c2Y = j - sprite.length / 2;
      if (color !== null) {
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        //rotate
        const rad = degree * (Math.PI / 180);
        const x1_rot = Math.round(c1X * Math.cos(rad) - c2Y * Math.sin(rad)); // การหมน
        const y2_rot = Math.round(c1X * Math.sin(rad) + c2Y * Math.cos(rad)); // การหมุน
        //scale
        const x1_scaled = Math.round(x1_rot * scaleX);
        const y2_scaled = Math.round(y2_rot * scaleY);
        //Translate
        const x1_translate = x1_scaled + x;
        const y2_translate = y2_scaled + y;

        drawEllipse(
          x1_translate,
          y2_translate,
          Math.round(scaleX),
          Math.round(scaleY),
          r,
          g,
          b,
          255,
        );
      }
    }
  }
}

function drawSprite(sprite, x, y, r, g, b, a = 255) {
  for (let j = 0; j < sprite.length; j++) {
    for (let i = 0; i < sprite[j].length; i++) {
      if (sprite[j][i] === 1) {
        putPixel(x + i, y + j, r, g, b, a);
      }
    }
  }
}

function drawSpriteRotateScale(
  sprite,
  x,
  y,
  degree,
  scaleX,
  scaleY,
  r,
  g,
  b,
  a = 255,
) {
  for (let j = 0; j < sprite.length; j++) {
    for (let i = 0; i < sprite[j].length; i++) {
      if (sprite[j][i] === 1) {
        const cX = i - sprite[j].length / 2;
        const cY = j - sprite.length / 2;
        //rotate
        const rad = degree * (Math.PI / 180);
        const x_rot = Math.round(cX * Math.cos(rad) - cY * Math.sin(rad)); // การหมน
        const y_rot = Math.round(cX * Math.sin(rad) + cY * Math.cos(rad)); // การหมุน
        //scale
        const x_scaled = Math.round(x_rot * scaleX);
        const y_scaled = Math.round(y_rot * scaleY);
        //Translate
        const x_translate = x_scaled + x;
        const y_translate = y_scaled + y;

        if (size === 1) {
          putPixel(x_translate, y_translate, r, g, b, a);
        } else {
          drawEllipse(
            x_translate,
            y_translate,
            Math.round(scaleX),
            Math.round(scaleY),
            r,
            g,
            b,
            a,
          );
        }
      }
    }
  }
}

function toScaledMousePos(posX, posY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.floor((posX - rect.left) * scaleX),
    y: Math.floor((posY - rect.top) * scaleY),
  };
}

let isDragging = false;
let previousX = 0;
let previousY = 0;
let r = 0,
  g = 0,
  b = 0,
  a = 255; // Default color
let degree = 0;
let size = 1;
let mouseX;
let mouseY;

canvas.addEventListener("click", (event) => {});

canvas.addEventListener("mousedown", (event) => {
  isDragging = true;
  console.log("Mouse down", event.offsetX, event.offsetY);
});

canvas.addEventListener("mouseup", (event) => {
  isDragging = false;
  console.log("Mouse up", event.offsetX, event.offsetY);
});

canvas.addEventListener("mousemove", (event) => {
  const { x, y } = toScaledMousePos(event.clientX, event.clientY);
  mouseX = x;
  mouseY = y;

  if (isDragging) {
    drawLine(previousX, previousY, x, y, r, g, b); // Draw a line from previous position to current position with the current color
    ctx.putImageData(imageData, 0, 0);
  }
  previousX = x;
  previousY = y;
});

window.addEventListener("keydown", (event) => {
  console.log("Key down:", event.key);
  if (event.key === "1") {
    r = 255;
    g = 0;
    b = 0; // Change to red
  } else if (event.key === "2") {
    r = 0;
    g = 255;
    b = 0; // Change to green
  } else if (event.key === "3") {
    r = 0;
    g = 0;
    b = 255; // Change to blue
  }

  if (event.key === "ArrowLeft") {
    degree -= 5;
  } else if (event.key === "ArrowRight") {
    degree += 5; // Decrease rotation degree
  }

  if (event.key === "ArrowUp") {
    size += 1;
  } else if (event.key === "ArrowDown") {
    size -= 1;
  }
});

window.addEventListener("keyup", (event) => {
  console.log("Key up:", event.key);
});

ctx.putImageData(imageData, 0, 0);

let isLeft = true;

let isSizeUp = true;
let sizeSmile = 1;
let count = 0;

function animate() {
  drawRectFilled(0, 0, canvas.width, canvas.height, 255, 255, 255);
  drawLine(100, 100, canvas.width - 1, 100, 0, 0, 0);
  drawLine(100, 100, 100, 0, 0, 0, 0);

  isSizeUp ? (sizeSmile += 0.005) : (sizeSmile -= 0.005);
  if(count > 350){
    isSizeUp = !isSizeUp
    count = 0
  }
  count += 1;

  // if (sizeSmile > 1.5 && isSizeUp) {
  //   isSizeUp = false;
  // } else if (sizeSmile <= 1 && !isSizeUp) {
  //   isSizeUp = true;
  // }
  drawSprite24Bit(smileSprite24Bit32x32, 155, 55, 0, sizeSmile, sizeSmile); // Draw a cyan space invader sprite

  !isLeft ? (degree += 0.5) : (degree -= 0.5);
  if (degree < -40 && isLeft) {
    isLeft = false;
  } else if (degree > 40 && !isLeft) {
    isLeft = true;
  }

  drawSpriteRotateScale(
    spaceInvaderSprite,
    mouseX,
    mouseY,
    degree,
    size,
    size,
    r,
    g,
    b,
  );

  ctx.putImageData(imageData, 0, 0);
  requestAnimationFrame(animate);
}
animate();

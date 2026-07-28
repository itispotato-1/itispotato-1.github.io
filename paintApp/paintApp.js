import { color, paintCanvas, buttonItem } from "./enumConst.js";
import {
  putPixel,
  drawRectFilled,
  drawRect,
  drawEllipse,
  drawLine,
  drawSprite,
} from "./paint.js";
import { imageData } from "./paint.js";
import handleInput from "./handleInput.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const Color = color;
const { x1, y1, x2, y2 } = paintCanvas;
// const { sprite, xStart, yStart } = buttonItem.item.pen;

const drawWindow = () => {
  drawRectFilled(0, 0, 500, 15, Color.gray.r, Color.gray.g, Color.gray.b);
  drawRectFilled(0, 0, 40, 500, Color.gray.r, Color.gray.g, Color.gray.b);
  drawRectFilled(0, 270, 500, 400, Color.gray.r, Color.gray.g, Color.gray.b);
  drawRect(x1, y1, x2, y2, 0, 0, 0);
};
const drawAllButton = () => {
  const keysItem = Object.keys(buttonItem);
  for (let i = 0; i < keysItem.length; i++) {
    let keysItem2 = Object.keys(buttonItem[keysItem[i]]);
    for (let j = 0; j < keysItem2.length; j++) {
      let item = buttonItem[keysItem[i]][keysItem2[j]];
      let xButtonStart = item.xStart;
      let yButtonStart = item.yStart;
      let xButtonEnd = item.xStart;
      let yButtonEnd = item.yStart;
      let r = 0;
      let g = 0;
      let b = 0;
      if (item.r != undefined) {
        r = item.r;
        g = item.g;
        b = item.b;
      }

      let sprite = item.sprite;

      if (keysItem[i] === "item" || keysItem[i] === "color") {
        xButtonEnd += 18;
        yButtonEnd += 18;
      } else if (keysItem[i] === "size") {
        xButtonEnd += 27;
        yButtonEnd += 12;
      }

      drawRectFilled(
        xButtonStart,
        yButtonStart,
        xButtonEnd,
        yButtonEnd,
        255,
        255,
        255,
      );
      drawSprite(sprite, xButtonStart + 2, yButtonStart + 2, r, g, b);
    }
  }
};

export const repaint = () => {
  drawWindow();
  drawAllButton();
  // drawRectFilled(xStart, yStart, xStart + 18, yStart + 18, 255, 255, 255);

  // drawSprite(sprite, xStart + 2, yStart + 2, 0, 0, 0);
};
repaint();
handleInput();

ctx.putImageData(imageData, 0, 0);
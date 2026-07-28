import {
  putPixel,
  drawRectFilled,
  drawRect,
  drawEllipse,
  drawLine,
  drawColorSprite,
  imageData,
  imageDataPreview,
  clearPreview,
} from "./paint.js";
import {
  color,
  paintCanvas,
  buttonItem,
  ENUM_ITEM,
  SIZE_ITEM,
} from "./enumConst.js";
import { repaint } from "./paintApp.js";

const handleInput = () => {
  let isDragging = false;
  let isEraser = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let r = 0,
    g = 0,
    b = 0,
    a = 255;

  let size = 1;
  let itemUseNow = "pen";
  let prevDelX = 0;
  let prevDelY = 0;

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const canvasPreview = document.getElementById("canvasPreview");
  const ctxPreview = canvasPreview.getContext("2d");

  const { x1, y1, x2, y2 } = paintCanvas;

  function toScaleMouseCoords(clientX, clinetY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((clientX - rect.left) * scaleX),
      y: Math.floor((clinetY - rect.top) * scaleY),
    };
  }

  const collisionButtonItem = (x, y) => {
    const keysItem = Object.keys(buttonItem);
    for (let i = 0; i < keysItem.length; i++) {
      //loopสำหรับการเช็กว่าเป็นobject item/color/size
      let keysItem2 = Object.keys(buttonItem[keysItem[i]]);
      for (let j = 0; j < keysItem2.length; j++) {
        //loopสำหรับการเช็กว่าเป็น item/color/sizeมีค่าอะไรบ้าง
        let item = buttonItem[keysItem[i]][keysItem2[j]];
        let xButton = item.xStart;
        let yButton = item.yStart;
        let xButtonEnd = item.xStart;
        let yButtonEnd = item.yStart;

        if (keysItem[i] === "item" || keysItem[i] === "color") {
          xButtonEnd += 18;
          yButtonEnd += 18;
        } else if (keysItem[i] === "size") {
          xButtonEnd += 27;
          yButtonEnd += 12;
        }

        if (x > xButton && x < xButtonEnd && yButton < y && yButtonEnd > y) {
          if (keysItem[i] === "item") {
            itemUseNow = keysItem2[j];
          } else if (keysItem[i] === "size") {
            size = SIZE_ITEM[j];
          } else if (keysItem[i] === "color") {
            r = item.r;
            g = item.g;
            b = item.b;
          }
          console.log("change to", keysItem2[j]);
          return;
        }
      }
    }
  };

  const collisionPaintCanvasCheck = (x, y) => {
    if (x > x1 && x < x2 && y1 < y && y2 > y) return true;
    return false;
  };

  canvas.addEventListener("mousedown", function (event) {
    const { x, y } = toScaleMouseCoords(event.clientX, event.clientY);
    
    collisionButtonItem(x, y);
    if (!collisionPaintCanvasCheck(x, y)) {
      isDragging = false;
      return;
    }
    isDragging = true; //กำหนดว่ากดค้าง

    if (
      itemUseNow !== ENUM_ITEM.ellipse ||
      itemUseNow !== ENUM_ITEM.rectangle
    ) {
      if (size === 1) {
        putPixel(x, y, r, g, b);
      } else {
        drawEllipse(x, y, size, size, r, g, b);
      }
    }
    if (
      itemUseNow === ENUM_ITEM.line ||
      itemUseNow === ENUM_ITEM.rectangle ||
      itemUseNow === ENUM_ITEM.ellipse
    ) {
      prevMouseX = x;
      prevMouseY = y;
    }
  });

  canvas.addEventListener("mouseup", function (event) {
    if (!isDragging) return;
    const { x, y } = toScaleMouseCoords(event.clientX, event.clientY);

    itemSelection(itemUseNow, x, y);

    isDragging = false;
  });

  canvas.addEventListener("mousemove", function (event) {
    const { x, y } = toScaleMouseCoords(event.clientX, event.clientY);

    if (!collisionPaintCanvasCheck(x, y)) return;

    if (isDragging) {
      let isPreview = false;
      if (itemUseNow !== ENUM_ITEM.pen) {
        isPreview = true;
      }

      itemSelection(itemUseNow, x, y, isPreview);
    }

    if (
      itemUseNow !== ENUM_ITEM.line &&
      itemUseNow != ENUM_ITEM.rectangle &&
      itemUseNow != ENUM_ITEM.ellipse
    ) {
      prevMouseX = x;
      prevMouseY = y;
    }

    repaint();
    ctx.putImageData(imageData, 0, 0);
    ctxPreview.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
    ctxPreview.putImageData(imageDataPreview, 0, 0);
  });

  window.addEventListener("keydown", function (event) {
    // console.log("keyDown", event.key);
    switch (event.key) {
      case "1":
        ((r = 255), (g = 0), (b = 0));
        console.log("red");
        break;
      case "2":
        ((r = 0), (g = 255), (b = 0));
        console.log("green");
        break;
      case "3":
        ((r = 0), (g = 0), (b = 255));
        console.log("blue");
        break;
      case "e":
        isEraser ? (isEraser = false) : (isEraser = true);

        console.log("white");
        break;
      case "[":
        size++;
        console.log("size +");
        break;
      case "]":
        if (size > 1) size--;
        console.log("size -");
        break;
    }
  });

  function itemSelection(item, x, y, isPreview = false) {
    console.log(isPreview);

    switch (item) {
      case ENUM_ITEM.pen:
        drawLine(prevMouseX, prevMouseY, x, y, r, g, b, a, size);
        break;
      case ENUM_ITEM.erazer:
        drawEllipse(x, y, size, size, 255, 255, 255);
        break;
      case ENUM_ITEM.line:
        if (isPreview) clearPreview();
        drawLine(prevMouseX, prevMouseY, x, y, r, g, b, a, size, isPreview);
        prevDelX = x;
        prevDelY = y;
        break;
      case ENUM_ITEM.rectangle:
        if (isPreview) clearPreview();
        drawRect(prevMouseX, prevMouseY, x, y, r, g, b, a, size, isPreview);
        prevDelX = x;
        prevDelY = y;
        break;
      case ENUM_ITEM.ellipse:
        let rX_Delete = Math.abs((prevMouseX - prevDelX) / 2);
        let rY_Delete = Math.abs((prevMouseY - prevDelY) / 2);
        let cX_Delete =
          prevMouseX < x ? prevMouseX + rX_Delete : prevDelX + rX_Delete;
        let cY_Delete =
          prevMouseY < y ? prevMouseY + rY_Delete : prevDelY + rY_Delete;

        let rX = Math.abs((prevMouseX - x) / 2);
        let rY = Math.abs((prevMouseY - y) / 2);
        let cX = prevMouseX < x ? prevMouseX + rX : x + rX;
        let cY = prevMouseY < y ? prevMouseY + rY : y + rY;
        if (isPreview) clearPreview();
        drawEllipse(cX, cY, rX, rY, r, g, b, a, isPreview);

        prevDelX = x;
        prevDelY = y;
        break;
      default:
        if (isPreview) clearPreview();
        drawLine(prevMouseX, prevMouseY, x, y, r, g, b, a, size, isPreview);
        break;
    }
  }
};
export default handleInput;

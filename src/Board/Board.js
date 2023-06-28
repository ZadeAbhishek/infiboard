import React, {
  useEffect
} from "react";
import "./Board.css";
import varaible from "../Compoenets/variable";
let global = varaible();
let currState = [];
let singleTouche = false;
let doubleTouche = false;
let leftmouseDown = false;
let rightMouseDown = false;
let tempstate = "HOLD";
export function redrawCanvas() {
  global.canvas.width = document.body.clientWidth;
  global.canvas.height = document.body.clientHeight;
  const context = global.canvas.getContext("2d");
  context.fillStyle = global.boardColor;
  context.fillRect(0, 0, global.canvas.width, global.canvas.height);
  for (let i = 0; i < global.drawing.length; i++) {
      if (global.drawing[i].type === "DRAW") {
          for (let j = 0; j < global.drawing[i].data.length; j++) {
              const line = global.drawing[i].data[j];
              drawline(toscreenX(line.x0), toscreenY(line.y0), toscreenX(line.x1),
                  toscreenY(line.y1),
                  global.drawing[i].data[j].strokeStyle,
                  global.drawing[i].data[j].lineWidth * global.scale
              );
          }
      }
      if (global.drawing[i].type === "SQUARE") {
          reDrawShape(global.drawing[i].data, context);
      }
      if (global.drawing[i].type === "ERASE") {
          for (let j = 0; j < global.drawing[i].data.length; j++) {
              const line = global.drawing[i].data[j];
              drawline(
                  toscreenX(line.x0),
                  toscreenY(line.y0),
                  toscreenX(line.x1),
                  toscreenY(line.y1),
                  global.boardColor,
                  global.drawing[i].data[j].lineWidth * global.scale
              );
          }
      }
  }
  if (global.draw === "SQUARE" && (global.shapeX && global.shapeY)) {
      drawShape(context);
  }
}

function reDrawShape(shape, context) {
  context.beginPath();
  context.fillStyle = shape.color;
  context.fillRect(
      toscreenX(shape.x),
      toscreenY(shape.y),
      currWidth(shape.width),
      currHeight(shape.height)
  );
  context.strokeRect(
      toscreenX(shape.x),
      toscreenY(shape.y),
      currWidth(shape.width),
      currHeight(shape.height)
  );
}

function drawShape(context) {
  context.beginPath();
  context.fillStyle = global.strokeStyle;
  context.fillRect(
      global.downX,
      global.downY,
      global.shapeX - global.downX,
      global.shapeY - global.downY
  );
  context.strokeRect(
      global.downX,
      global.downY,
      global.shapeX - global.downX,
      global.shapeY - global.downY
  );
  // context.clearRect(
  //   global.downX,
  //   global.downY,
  //   global.shapeX - global.downX,
  //   global.shapeY - global.downY
  // );
}

function saveRerender(prevx, prevy, x, y) {
  currState.push({
      x0: prevx,
      y0: prevy,
      x1: x,
      y1: y,
      strokeStyle:global.strokeStyle,
      lineWidth: (global.draw === "DRAW" ? global.strokeWidth / global.scale : (global.strokeWidth * 10) / global.scale),
  });
}

function pushShape() {
  // x /scale = offset
  global.state++;
  global.drawing.push({
      type: global.draw,
      state: global.state,
      data: {
          x: totrueX(global.downX),
          y: totrueY(global.downY),
          width: (global.shapeX - global.downX) / global.scale,
          height: (global.shapeY - global.downY) / global.scale,
          color: global.strokeStyle,
      }
  });
  global.draw = "HOLD";
  redrawCanvas();
  global.downX = 0;
  global.downY = 0;
  global.shapeX = 0;
  global.shapeY = 0;
}

function toscreenX(xTrue) {
  return (xTrue + global.offsetX) * global.scale;
}

function toscreenY(yTrue) {
  return (yTrue + global.offsetY) * global.scale;
}
// screen to original coordinate
function totrueX(xscreen) {
  return xscreen / global.scale - global.offsetX;
}

function totrueY(yscreen) {
  return yscreen / global.scale - global.offsetY;
}

function currHeight(height) {
  return height * global.scale;
}

function currWidth(Width) {
  return Width * global.scale;
}

function trueHeight() {
  return global.canvas.clientHeight / global.scale;
}

function trueWidth() {
  return global.canvas.clientWidth / global.scale;
}

function drawline(x0, y0, x1, y1, color, lineWidth) {
  const context = global.canvas.getContext("2d");
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
}

function iS_on_Shape(x, y, shape) {
  if (shape.type === "SQUARE") {
      let shape_left = toscreenX(shape.data.x);
      let shape_right = toscreenX(shape.data.x) + currWidth(shape.data.width);
      let shape_top = toscreenY(shape.data.y);
      let shape_bottom = toscreenY(shape.data.y) + currHeight(shape.data.height);
      if (x > shape_left && x < shape_right && y > shape_top && y < shape_bottom)
          return true;
      if (x > shape_right && x < shape_left && y > shape_bottom && y < shape_top)
          return true;
      if (x > shape_left && x < shape_right && y > shape_bottom && y < shape_top)
          return true;
      if (x > shape_right && x < shape_left && y > shape_top && y < shape_bottom)
          return true;
      else return false;
  }
  if (shape.type === "DRAW") {}
  return false;
}

function mouseDown(e) {
  e.preventDefault();
  if (e.button === 0) {
      leftmouseDown = true;
      rightMouseDown = false;
  }
  if (e.button === 2) {
      leftmouseDown = false;
      rightMouseDown = true;
  }
  global.prevState = global.draw;
  let index = 0;
  for (let shape of global.drawing) {
      if (iS_on_Shape(e.pageX, e.pageY, shape)) {
          global.draw = "OnShape";
          global.shape_index = index;
      }
      index++;
  }
  // update cursor coordinates
  global.cursorX = e.pageX;
  global.cursorY = e.pageY;
  global.prevcursorX = e.pageX;
  global.prevcursorY = e.pageY;
  global.downX = e.pageX;
  global.downY = e.pageY;
}

function mouseUp() {
  leftmouseDown = false;
  rightMouseDown = false;
  if ((global.draw === "DRAW" || global.draw === "ERASE") && currState.length > 0) {
      global.state++;
      global.drawing.push({
          type: global.draw,
          state: global.state,
          data: currState
      });
  }
  currState = [];
  if (global.draw === "SQUARE" && (global.shapeX && global.shapeY)) {
      pushShape();
  }
  global.draw = global.prevState;
}

function mouseMove(e) {
  if (leftmouseDown) {
      global.cursorX = e.pageX;
      global.cursorY = e.pageY;
      const scaledx = totrueX(global.cursorX);
      const scaledy = totrueY(global.cursorY);
      const prevscaledx = totrueX(global.prevcursorX);
      const prevscaledy = totrueY(global.prevcursorY);
      if (global.draw === "DRAW" || global.draw === "ERASE") {
          saveRerender(prevscaledx, prevscaledy, scaledx, scaledy);
          drawline(
              global.prevcursorX,
              global.prevcursorY,
              global.cursorX,
              global.cursorY,
              (global.draw === "DRAW" ? global.strokeStyle : global.boardColor),
              (global.draw === "DRAW" ? global.strokeWidth : (global.strokeWidth * 10)),
          );
      }
      if (global.draw === "OnShape") {
          global.drawing[global.shape_index].data.x +=
              (global.cursorX - global.prevcursorX) / global.scale;
          global.drawing[global.shape_index].data.y +=
              (global.cursorY - global.prevcursorY) / global.scale;
          redrawCanvas();
      }
      if (global.draw === "PAN") {
          global.offsetX += (global.cursorX - global.prevcursorX) / global.scale;
          global.offsetY += (global.cursorY - global.prevcursorY) / global.scale;
          redrawCanvas();
      }
      if (global.draw === "SQUARE") {
          global.shapeX = global.cursorX;
          global.shapeY = global.cursorY;
          redrawCanvas();
      }
  }
  global.prevcursorX = global.cursorX;
  global.prevcursorY = global.cursorY;
}

function mouseWheel(e) {
  const deltY = e.deltaY;
  const scaleAmount = -deltY / 500;
  global.scale = global.scale * (1 + scaleAmount);
  // zoom the page basaed on wher curson is
  var distx = e.pageX / global.canvas.clientHeight;
  var disty = e.pageY / global.canvas.clientWidth;
  // calcualte how we need to zoom
  const unitZoomedx = trueHeight() * scaleAmount;
  const unitZoomedy = trueWidth() * scaleAmount;
  const unitAddLeft = unitZoomedx * distx;
  const unitAddRight = unitZoomedy * disty;
  global.offsetX -= unitAddLeft;
  global.offsetY -= unitAddRight;
  redrawCanvas();
}

function touchStart(e) {
  if (e.touches.length === 1) {
      singleTouche = true;
      doubleTouche = false;
  }
  if (e.touches.length >= 2) {
      singleTouche = false;
      doubleTouche = true;
  }
  global.prevState = global.draw;
  let index = 0;
  for (let shape of global.shapes) {
      if (iS_on_Shape(e.touches[0].pageX, e.touches[0].pageY, shape.data)) {
          global.draw = "OnShape";
          global.shape_index = index;
      }
      index++;
  }
  global.downX = e.touches[0].pageX;
  global.downY = e.touches[0].pageY;
  global.prevTouches[0] = e.touches[0];
  global.prevTouches[1] = e.touches[1];
}

function touchEnd(e) {
  singleTouche = false;
  doubleTouche = false;
  if ((global.draw === "DRAW" || global.draw === "ERASE") && currState.length > 0) {
      global.state++;
      global.drawing.push({
          state: global.state,
          data: currState
      });
  }
  currState = [];
  if (global.draw === "SQUARE" && (global.shapeX && global.shapeY)) {
      pushShape();
  }
  global.draw = global.prevState;
}

function touchMove(e) {
  global.touch0x = e.touches[0].pageX;
  global.touch0y = e.touches[0].pageY;
  global.prevTouch0x = global.prevTouches[0].pageX;
  global.prevTouch0y = global.prevTouches[0].pageY;
  const scaledx = totrueX(global.touch0x);
  const scaledy = totrueY(global.touch0y);
  const prevscaledx = totrueX(global.prevTouch0x);
  const prevscaledy = totrueY(global.prevTouch0y);
  if (singleTouche) {
      if (global.draw === "DRAW" || global.draw === "ERASE") {
          currState.push({
              x0: prevscaledx,
              y0: prevscaledy,
              x1: scaledx,
              y1: scaledy,
              strokeStyle: global.draw === "DRAW" ? global.strokeStyle : global.boardColor,
              lineWidth: (global.draw === "DRAW" ? global.strokeWidth / global.scale : (global.strokeWidth * 10) / global.scale),
          });
          drawline(
              global.prevTouch0x,
              global.prevTouch0y,
              global.touch0x,
              global.touch0y,
              (global.draw === "DRAW" ? global.strokeStyle : global.boardColor),
              (global.draw === "DRAW" ? global.strokeWidth : (global.strokeWidth * 10)),
          );
      }
      if (global.draw === "PAN") {
          global.offsetX += (global.touch0x - global.prevTouch0x) / global.scale;
          global.offsetY += (global.touch0y - global.prevTouch0y) / global.scale;
          redrawCanvas();
      }
      if (global.draw === "SQUARE") {
          global.shapeX = global.touch0x;
          global.shapeY = global.touch0y;
          redrawCanvas();
      }
      if (global.draw === "OnShape") {
          global.shapes[global.shape_index].data.x +=
              (global.touch0x - global.prevTouch0x) / global.scale;
          global.shapes[global.shape_index].data.y +=
              (global.touch0y - global.prevTouch0y) / global.scale;
          redrawCanvas();
      }
  }
  if (doubleTouche) {
      // important
      // get second coordinate curr and pevious
      global.touch1x = e.touches[1].pageX;
      global.touch1y = e.touches[1].pageY;
      global.prevTouch1x = global.prevTouches[1].pageX;
      global.prevTouch1y = global.prevTouches[1].pageY;
      // get mid point for curr and previous
      const midx = (global.touch0x + global.touch1x) / 2;
      const midy = (global.touch0y + global.touch1y) / 2;
      const prevmidx = (global.prevTouch0x + global.prevTouch1x) / 2;
      const prevmidy = (global.prevTouch0y + global.prevTouch1y) / 2;
      // calcualte distance between touches
      const hypot = Math.sqrt(
          Math.pow(global.touch0x - global.touch1x, 2) +
          Math.pow(global.touch0y - global.touch1y, 2)
      );
      const prevHypot = Math.sqrt(
          Math.pow(global.prevTouch0x - global.prevTouch1x, 2) +
          Math.pow(global.prevTouch0y - global.prevTouch1y, 2)
      );
      // calcuate screen scale values
      var zoomAmount = hypot / prevHypot;
      global.scale *= zoomAmount; // change scale
      const scaleAmount = 1 - zoomAmount; // how much we have scale since zoomount is always between 0 to 1
      //cal how many pixel to be move in x and y dir
      const panX = midx - prevmidx; // deltx
      const panY = midy - prevmidy; // delyy
      //scale this based on zoom level
      global.offsetX += panX / global.scale; // make changes to global x
      global.offsetY += panY / global.scale; // make changes to global y
      //get realtive position of zoom
      var zoomRatioX = midx / global.canvas.clientWidth; // curr position of x according to scale
      var zoomRatioY = midy / global.canvas.clientHeight; // curr position of y according to scale
      const unitZoomedX = trueWidth() * scaleAmount; // how much zoom in x
      const unitZoomedy = trueHeight() * scaleAmount; // how much zoom in y
      const unitLeft = unitZoomedX * zoomRatioX; // cal curr left
      const unitTop = unitZoomedy * zoomRatioY; // cal curr top
      global.offsetX += unitLeft; // add to gobal
      global.offsetY += unitTop;
      redrawCanvas(); // redraw
  }
  global.prevTouches[0] = e.touches[0];
  global.prevTouches[1] = e.touches[1];
}
export default function Board() {
  useEffect(() => {
      global.canvas = document.getElementById("board");
      const context = global.canvas.getContext("2d");
      //disable right click
      document.oncontextmenu = function() {
          return false;
      };
      redrawCanvas();
      window.addEventListener("resize", (e) => {
          redrawCanvas();
      });
      global.canvas.addEventListener("mousedown", mouseDown);
      global.canvas.addEventListener("mouseup", mouseUp, false);
      global.canvas.addEventListener("mousemove", mouseMove, false);
      global.canvas.addEventListener("wheel", mouseWheel, false);
      global.canvas.addEventListener("touchstart", touchStart);
      global.canvas.addEventListener("touchend", touchEnd);
      global.canvas.addEventListener("touchmove", touchMove);
  }, []);
  return ( <> < canvas id = "board" > Board </canvas> </> );
}
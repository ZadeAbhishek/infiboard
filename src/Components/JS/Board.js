import React, { useEffect } from "react";
import "../CSS/Board.css";
import varaible from "./variable";

// Initialize global variables
let global = varaible();
let currState = [];
let singleTouche = false;
let doubleTouche = false;
let leftmouseDown = false;
// eslint-disable-next-line
let rightMouseDown = false;

// Function to redraw the canvas
export function redrawCanvas() {
    // Set the canvas size to match the window dimensions
    global.canvas.width = document.body.clientWidth;
    global.canvas.height = document.body.clientHeight;
  
    // Fill the canvas with the specified background color
    global.context.fillStyle = global.boardColor;
    global.context.fillRect(0, 0, global.canvas.width, global.canvas.height);
  
    // Loop through the drawing data and render shapes
    for (let i = 0; i < global.drawing.length; i++) {
      // If the drawing is of type "DRAW"
      if (global.drawing[i].type === "DRAW") {
        // Loop through the data points of the drawing
        for (let j = 0; j < global.drawing[i].data.length; j++) {
          const line = global.drawing[i].data[j];
          global.Path2d = new Path2D();
          // Draw a line with specified attributes
          drawline(
            toscreenX(line.x0),
            toscreenY(line.y0),
            toscreenX(line.x1),
            toscreenY(line.y1),
            global.drawing[i].data[j].strokeStyle,
            global.drawing[i].data[j].lineWidth * global.scale
          );
        }
      }
      // If the drawing is of type "SQUARE"
      if (global.drawing[i].type === "SQUARE") {
        // Redraw the square shape
        reDrawShape(global.drawing[i].data);
      }
      // If the drawing is of type "ERASE"
      if (global.drawing[i].type === "ERASE") {
        // Loop through the data points of the eraser
        for (let j = 0; j < global.drawing[i].data.length; j++) {
          const line = global.drawing[i].data[j];
          global.Path2d = new Path2D();
          // Draw an erased line with specified attributes
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
  
    // Draw the shape in progress if the drawing mode is "SQUARE"
    if (global.draw === "SQUARE" && (global.shapeX && global.shapeY)) {
      drawShape();
    }
  }

// Function to redraw a square shape
function reDrawShape(shape) {
    // Begin a new path for drawing on the canvas
    global.context.beginPath();
  
    // Set the fill style to the color of the shape
    global.context.fillStyle = shape.color;
  
    // Draw a filled rectangle using the specified dimensions and positions
    global.context.fillRect(
      toscreenX(shape.x),
      toscreenY(shape.y),
      currWidth(shape.width),
      currHeight(shape.height)
    );
  
    // Draw the outline of the rectangle using stroke
    global.context.strokeRect(
      toscreenX(shape.x),
      toscreenY(shape.y),
      currWidth(shape.width),
      currHeight(shape.height)
    );
  }

function drawShape() {
  global.context.beginPath();
  global.context.fillStyle = global.strokeStyle;
  global.context.fillRect(
      global.downX,
      global.downY,
      global.shapeX - global.downX,
      global.shapeY - global.downY
  );
  global.context.strokeRect(
      global.downX,
      global.downY,
      global.shapeX - global.downX,
      global.shapeY - global.downY
  );
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
  global.context.beginPath();
  global.Path2d.moveTo(x0, y0);
  global.Path2d.lineTo(x1, y1);
  global.context.strokeStyle = color;
  global.context.lineWidth = lineWidth;
  global.context.stroke(global.Path2d);
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
  // if (shape.type === "DRAW") {}
  return false;
}

function panMove(x1,y1,x0,y0){
    // need for improvements
    let time = new Date().getTime() - global.downTime;
    let velocity = (Math.sqrt(Math.pow((x1-x0),2)+Math.pow((y1-y0),2)))/time;
    let speedIndex = 2;
    global.accX = ((x1-x0))/time;
    global.accY = ((y1-y0))/time;
    global.accX *= speedIndex;
    global.accY *= speedIndex;
    global.accX *= Math.abs(velocity/global.scale);
    global.accY *= Math.abs(velocity/global.scale); 
    global.raf = requestAnimationFrame(accPan);
    setTimeout(() => {cancelAnimationFrame(global.raf);}, 500); // to stop infinite Acceleration
}

function accPan(){
  global.offsetX += global.accX;
  global.offsetY += global.accY;
  global.accX *= 0.89;
  global.accY *= 0.89;  
  redrawCanvas();
  global.raf = requestAnimationFrame(accPan);
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
      if (shape.type === "SQUARE" && iS_on_Shape(e.clientX, e.clientY, shape)) {
          global.draw = "OnShape";
          global.shape_index = index;
      }
      index++;
  }
  // update cursor coordinates
  cancelAnimationFrame(global.raf);
  global.Path2d = new Path2D();
  global.downTime = new Date().getTime();
  global.accX = 0;
  global.accY = 0;
  global.cursorX = e.clientX;
  global.cursorY = e.clientY;
  global.prevcursorX = e.clientX;
  global.prevcursorY = e.clientY;
  global.downX = e.clientX;
  global.downY = e.clientY;
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

  if(global.draw === "PAN"){
    let x1 = global.cursorX;
    let y1 = global.cursorY;
    let x0 = global.downX;
    let y0 = global.downY;
    panMove(x1,y1,x0,y0);
}
  global.draw = global.prevState;
}

function mouseMove(e) {
  if (leftmouseDown) {
      global.cursorX = e.clientX;
      global.cursorY = e.clientY;
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
  // const rect = global.context.canvas.getBoundingClientRect();
  // const x = e.clientX - rect.left;
  // const y = e.clientY - rect.top;
  // if(global.context.isPointInStroke(x,y)) console.log("True");
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
  for (let shape of global.drawing) {
      if (iS_on_Shape(e.touches[0].clientX, e.touches[0].clientY, shape)) {
          global.draw = "OnShape";
          global.shape_index = index;
      }
      index++;
  }
  cancelAnimationFrame(global.raf);
  global.downTime = new Date().getTime();
  global.accX = 0;
  global.accY = 0;
  global.downX = e.touches[0].clientX;
  global.downY = e.touches[0].clientY;
  global.prevTouches[0] = e.touches[0];
  global.prevTouches[1] = e.touches[1];
}

function touchEnd(e) {
  if ((global.draw === "DRAW" || global.draw === "ERASE") && currState.length > 0) {
      global.state++;
      global.drawing.push({
          type: global.draw,
          state: global.state,
          data: currState
      });
  }
  if(global.draw === "PAN" && doubleTouche === false){
    let x1 = global.touch0x;
    let y1 = global.touch0y;
    let x0 = global.downX;
    let y0 = global.downY;
    panMove(x1,y1,x0,y0);
}
  currState = [];
  if (global.draw === "SQUARE" && (global.shapeX && global.shapeY)) {
      pushShape();
  }
  singleTouche = false;
  doubleTouche = false;
  global.draw = global.prevState;
}

function touchMove(e) {
  global.touch0x = e.touches[0].clientX;
  global.touch0y = e.touches[0].clientY;
  global.prevTouch0x = global.prevTouches[0].clientX;
  global.prevTouch0y = global.prevTouches[0].clientY;
  const scaledx = totrueX(global.touch0x);
  const scaledy = totrueY(global.touch0y);
  const prevscaledx = totrueX(global.prevTouch0x);
  const prevscaledy = totrueY(global.prevTouch0y);
  if (singleTouche) {
      if (global.draw === "DRAW" || global.draw === "ERASE") {
          saveRerender(prevscaledx, prevscaledy, scaledx, scaledy);
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
          global.drawing[global.shape_index].data.x +=
              (global.touch0x - global.prevTouch0x) / global.scale;
          global.drawing[global.shape_index].data.y +=
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
      global.context = global.canvas.getContext("2d");
      global.rect = global.canvas.getBoundingClientRect();
      global.Path2d = new Path2D();
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
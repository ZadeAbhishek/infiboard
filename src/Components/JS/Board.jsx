import React, { Component } from "react";
import "../CSS/Board.css";
import Header from './Header'
import ToolBox from './ToolBox'

class Stack {
    constructor() {
        this.data = [];
    }
    push(data) {
        this.data.reverse();
        this.data.push(data);
        this.data.reverse();
    }
    pop() {
        if (this.data.length === 0) return null;
        let curr = this.data[0];
        this.data.reverse();
        this.data.pop();
        this.data.reverse();
        return curr;
    }
    top() {
        if (this.data.length === 0) return null;
        return this.data[0];
    }
    print() {
        console.log(...this.data);
    }
}


export default class Board extends Component {
    
    constructor(props){
        super(props);
       this.global = {
        projectName: 'untitled',
        draw: 'HOLD',
        prevState: 'HOLD',
        focusCenter: false,
        drawing: new Array(),
        shapes:  new Array(),
        cursorX: 0,
        cursorY: 0,
        prevcursorX: 0,
        prevcursorY: 0,
        downX: 0,
        downY: 0,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        prevTouches: [null, null],
        touch0x: 0,
        touch0y: 0,
        touch1x: 0,
        touch1y: 0,
        prevTouch0x: 0,
        prevTouch0y: 0,
        prevTouch1x: 0,
        prevTouch1y: 0,
        shapeX: 0,
        shapeY: 0,
        canvas: document.getElementById("board"),
        strokeStyle: '#fff',
        strokeWidth: 2,
        boardColor: "#000000",
        state: 0,
        stack: new Stack(),
        shape_index: 0,
        offsetLeft: 0,
        offsetTop: 0,
        Path2d: null,
        context: null,
        rect: null,
        velocity: null,
        downTime: null,
        accX: 0,
        accY: 0,
        raf: null,
        currState: new Array(),
    }

}


  componentDidMount(){
    this.global.canvas = document.getElementById("board");
    this.global.context = this.global.canvas.getContext("2d");
    this.global.rect = this.global.canvas.getBoundingClientRect();
    this.global.Path2d = new Path2D();
    //disable right click
    document.oncontextmenu = function() {
        return false;
    };
    
    this.Render.redrawCanvas();

    window.addEventListener("resize", (e) => {
        this.Render.redrawCanvas();
    });
    this.global.canvas.addEventListener("mousedown", this.listners.mouseDown);
    this.global.canvas.addEventListener("mouseup", this.listners.mouseUp, false);
    this.global.canvas.addEventListener("mousemove", this.listners.mouseMove, false);
    this.global.canvas.addEventListener("wheel", this.listners.mouseWheel, false);
    this.global.canvas.addEventListener("touchstart", this.listners.touchStart);
    this.global.canvas.addEventListener("touchend", this.listners.touchEnd);
    this.global.canvas.addEventListener("touchmove", this.listners.touchMove);
  }

  Render = {
    // Function to redraw the canvas
    redrawCanvas : () => {
    // Set the canvas size to match the window dimensions
    this.global.canvas.width = document.body.clientWidth;
    this.global.canvas.height = document.body.clientHeight;

    // Fill the canvas with the specified background color
    this.global.context.fillStyle = this.global.boardColor;
    this.global.context.fillRect(0, 0, this.global.canvas.width, this.global.canvas.height);

    // Loop through the drawing data and Render shapes
    for (let i = 0; i < this.global.drawing.length; i++) {
        // If the drawing is of type "DRAW"
        if (this.global.drawing[i].type === "DRAW") {
            // Loop through the data points of the drawing
            for (let j = 0; j < this.global.drawing[i].data.length; j++) {
                const line = this.global.drawing[i].data[j];
                // Draw a line with specified attributes
                this.Render.drawline(
                    this.Render.toscreenX(line.x0),
                    this.Render.toscreenY(line.y0),
                    this.Render.toscreenX(line.x1),
                    this.Render.toscreenY(line.y1),
                    this.global.drawing[i].data[j].strokeStyle,
                    this.global.drawing[i].data[j].lineWidth * this.global.scale
                );
            }
        }
        // If the drawing is of type "SQUARE"
        if (this.global.drawing[i].type === "SQUARE") {
            // Redraw the square shape
            this.Render.reDrawShape(this.global.drawing[i].data);
        }
        // If the drawing is of type "ERASE"
        if (this.global.drawing[i].type === "ERASE") {
            // Loop through the data points of the eraser
            for (let j = 0; j < this.global.drawing[i].data.length; j++) {
                const line = this.global.drawing[i].data[j];
                // Draw an erased line with specified attributes
                this.Render.drawline(
                    this.Render.toscreenX(line.x0),
                    this.Render.toscreenY(line.y0),
                    this.Render.toscreenX(line.x1),
                    this.Render.toscreenY(line.y1),
                    this.global.boardColor,
                    this.global.drawing[i].data[j].lineWidth * this.global.scale
                );
            }
        }
    }

    // Draw the shape in progress if the drawing mode is "SQUARE"
    if (this.global.draw === "SQUARE" && (this.global.shapeX && this.global.shapeY)) {
        this.Render.drawShape();
    }
},

// Function to redraw a square shape
   reDrawShape : (shape) => {
    // Begin a new path for drawing on the canvas
    this.global.context.beginPath();

    // Set the fill style to the color of the shape
    this.global.context.fillStyle = shape.color;

    // Draw a filled rectangle using the specified dimensions and positions
    this.global.context.fillRect(
        this.Render.toscreenX(shape.x),
        this.Render.toscreenY(shape.y),
        this.Render.currWidth(shape.width),
        this.Render.currHeight(shape.height)
    );


},
   drawShape :() => {
    this.global.context.beginPath();
    this.global.context.fillStyle = global.strokeStyle;
    this.global.context.fillRect(
        this.global.downX,
        this.global.downY,
        this.global.shapeX - global.downX,
        this.global.shapeY - global.downY
    );
},
 
 saveReRender : (prevx, prevy, x, y) => {
    this.global.currState.push({
        x0: prevx,
        y0: prevy,
        x1: x,
        y1: y,
        strokeStyle: this.global.strokeStyle,
        lineWidth: (this.global.draw === "DRAW" ? this.global.strokeWidth / this.global.scale : (this.global.strokeWidth * 10) / this.global.scale),
    });
},

   pushShape :()=> {
    // x /scale = offset
    this.global.state++;
    this.global.drawing.push({
        type: this.global.draw,
        state: this.global.state,
        data: {
            x: this.Render.totrueX(this.global.downX),
            y: this.Render.totrueY(this.global.downY),
            width: (this.global.shapeX - this.global.downX) / this.global.scale,
            height: (this.global.shapeY - this.global.downY) / this.global.scale,
            color: this.global.strokeStyle,
        }
    });
    this.global.draw = "HOLD";
    this.Render.redrawCanvas();
    this.global.downX = 0;
    this.global.downY = 0;
    this.global.shapeX = 0;
    this.global.shapeY = 0;
},

 toscreenX:(xTrue) => {
    return (xTrue + this.global.offsetX) * this.global.scale;
},

 toscreenY:(yTrue) => {
    return (yTrue + this.global.offsetY) * this.global.scale;
},
// screen to original coordinate
 totrueX : (xscreen)=> {
    return xscreen / this.global.scale - this.global.offsetX;
},

totrueY : (yscreen) => {
    return yscreen / this.global.scale - this.global.offsetY;
},

currHeight : (height) => {
    return height * this.global.scale;
},

currWidth : (Width) => {
    return Width * this.global.scale;
},

trueHeight :()  => {
    return this.global.canvas.clientHeight / this.global.scale;
},

trueWidth :() => {
    return this.global.canvas.clientWidth / this.global.scale;
},

drawline :(x0, y0, x1, y1, color, lineWidth) => {
    // Adjust the coordinates to align with whole pixels
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    // Set the stroke style and line properties
    this.global.context.strokeStyle = color;
    this.global.context.lineWidth = lineWidth;
    this.global.context.lineCap = 'round';
    this.global.context.lineJoin = 'round';

    // Begin a new path and move to the adjusted starting point
    this.global.context.beginPath();
    this.global.context.moveTo(x0 + 0.5, y0 + 0.5); // Add 0.5 to align with the center of the pixel

    // Draw a line to the adjusted ending point and stroke it
    this.global.context.lineTo(x1 + 0.5, y1 + 0.5); // Add 0.5 to align with the center of the pixel
    this.global.context.stroke();
}
  }

listners = {
    singleTouche : false,
    doubleTouche : false,
    leftmouseDown : false,
// eslint-disable-next-line
    rightMouseDown : false,

// Initialize global variables


    mouseDown : (e) => {
    e.preventDefault();
    if (e.button === 0) {
        this.listners.leftmouseDown = true;
        this.listners.rightMouseDown = false;
    }
    if (e.button === 2) {
        this.listners.leftmouseDown = false;
        this.listners.rightMouseDown = true;
    }
    this.global.prevState = this.global.draw;
    let index = 0;
    for (let shape of this.global.drawing) {
        if (shape.type === "SQUARE" && this.listners.iS_on_Shape(e.clientX, e.clientY, shape)) {
            this.global.draw = "OnShape";
            this.global.shape_index = index;
        }
        index++;
    }
    // update cursor coordinates
    cancelAnimationFrame(this.global.raf);
    this.global.downTime = new Date().getTime();
    this.global.accX = 0;
    this.global.accY = 0;
    this.global.cursorX = e.clientX;
    this.global.cursorY = e.clientY;
    this.global.prevcursorX = e.clientX;
    this.global.prevcursorY = e.clientY;
    this.global.downX = e.clientX;
    this.global.downY = e.clientY;
},


 mouseUp :() => {
    this.listners.leftmouseDown = false;
    this.listners.rightMouseDown = false;
    if ((this.global.draw === "DRAW" || this.global.draw === "ERASE") && this.global.currState.length > 0) {
        this.global.state++;
        this.global.drawing.push({
                type: this.global.draw,
                state: this.global.state,
                data: this.global.currState,
            });
    }
    this.global.currState = [];
    if (this.global.draw === "SQUARE" && (this.global.shapeX && this.global.shapeY)) {
        this.Render.pushShape();
    }

    if (this.global.draw === "PAN") {
        let x1 = this.global.cursorX;
        let y1 = this.global.cursorY;
        let x0 = this.global.downX;
        let y0 = this.global.downY;
        this.listners.panMove(x1, y1, x0, y0);
    }
    this.global.draw = this.global.prevState;
    //redrawCanvas();
},

    mouseMove :(e) =>{
    if (this.listners.leftmouseDown) {
        this.global.cursorX = e.clientX;
        this.global.cursorY = e.clientY;
        const scaledx = this.Render.totrueX(this.global.cursorX);
        const scaledy = this.Render.totrueY(this.global.cursorY);
        const prevscaledx = this.Render.totrueX(this.global.prevcursorX);
        const prevscaledy = this.Render.totrueY(this.global.prevcursorY);
        if (this.global.draw === "DRAW" || this.global.draw === "ERASE") {
            this.Render.saveReRender(prevscaledx, prevscaledy, scaledx, scaledy);
            this.Render.drawline(
                this.global.prevcursorX,
                this.global.prevcursorY,
                this.global.cursorX,
                this.global.cursorY,
                (this.global.draw === "DRAW" ? this.global.strokeStyle : this.global.boardColor),
                (this.global.draw === "DRAW" ? this.global.strokeWidth : (this.global.strokeWidth * 10)),
            );
        }

        if (this.global.draw === "OnShape") {
            this.global.drawing[this.global.shape_index].data.x +=
                (this.global.cursorX - this.global.prevcursorX) / this.global.scale;
                this.global.drawing[this.global.shape_index].data.y +=
                (this.global.cursorY - this.global.prevcursorY) / this.global.scale;
            this.Render.redrawCanvas();
        }
        if (this.global.draw === "PAN") {
            this.global.offsetX += ((this.global.cursorX - this.global.prevcursorX) / this.global.scale);
            this.global.offsetY += (this.global.cursorY - this.global.prevcursorY) / this.global.scale;
            this.Render.redrawCanvas();
        }
        if (this.global.draw === "SQUARE") {
            this.global.shapeX = this.global.cursorX;
            this.global.shapeY = this.global.cursorY;
            this.Render.redrawCanvas();
        }
    }
    this.global.prevcursorX = this.global.cursorX;
    this.global.prevcursorY = this.global.cursorY;
},

mouseWheel :(e) => {
    const deltY = e.deltaY;
    const scaleAmount = -deltY / 500;
    this.global.scale = this.global.scale * (1 + scaleAmount);
    // zoom the page basaed on wher curson is
    var distx = e.pageX / this.global.canvas.clientHeight;
    var disty = e.pageY / this.global.canvas.clientWidth;
    // calcualte how we need to zoom
    const unitZoomedx = this.Render.trueHeight() * scaleAmount;
    const unitZoomedy = this.Render.trueWidth() * scaleAmount;
    const unitAddLeft = unitZoomedx * distx;
    const unitAddRight = unitZoomedy * disty;
    this.global.offsetX -= unitAddLeft;
    this.global.offsetY -= unitAddRight;
    this.Render.redrawCanvas();
},

touchStart :(e) => {
    if (e.touches.length === 1) {
        this.listners.singleTouche = true;
        this.listners.doubleTouche = false;
    }
    if (e.touches.length >= 2) {
        this.listners.singleTouche = false;
        this.listners.doubleTouche = true;
    }
    this.global.prevState = this.global.draw;
    let index = 0;
    for (let shape of this.global.drawing) {
        if (this.listners.iS_on_Shape(e.touches[0].clientX, e.touches[0].clientY, shape)) {
            this.global.draw = "OnShape";
            this.global.shape_index = index;
        }
        index++;
    }
    cancelAnimationFrame(this.global.raf);
    this.global.downTime = new Date().getTime();
    this.global.accX = 0;
    this.global.accY = 0;
    this.global.downX = e.touches[0].clientX;
    this.global.downY = e.touches[0].clientY;
    this.global.prevTouches[0] = e.touches[0];
    this.global.prevTouches[1] = e.touches[1];
},

touchEnd :(e) => {
    if ((this.global.draw === "DRAW" || this.global.draw === "ERASE") && this.global.currState.length > 0) {
        this.global.state++;
        this.global.drawing.push({
            type: this.global.draw,
            state: this.global.state,
            data: this.global.currState
        });
    }
    if (this.global.draw === "PAN" && this.listners.doubleTouche === false) {
        let x1 = this.global.touch0x;
        let y1 = this.global.touch0y;
        let x0 = this.global.downX;
        let y0 = this.global.downY;
        this.listners.panMove(x1, y1, x0, y0);
    }
    this.global.currState = [];
    if (this.global.draw === "SQUARE" && (this.global.shapeX && this.global.shapeY)) {
        this.Render.pushShape();
    }
    this.listners.singleTouche = false;
    this.listners.doubleTouche = false;
    this.global.draw = this.global.prevState;

},

touchMove:(e) => {
    this.global.touch0x = e.touches[0].clientX;
    this.global.touch0y = e.touches[0].clientY;
    this.global.prevTouch0x = this.global.prevTouches[0].clientX;
    this.global.prevTouch0y = this.global.prevTouches[0].clientY;
    const scaledx = this.Render.totrueX(this.global.touch0x);
    const scaledy = this.Render.totrueY(this.global.touch0y);
    const prevscaledx = this.Render.totrueX(this.global.prevTouch0x);
    const prevscaledy = this.Render.totrueY(this.global.prevTouch0y);
    if (this.listners.singleTouche) {
        if (this.global.draw === "DRAW" || this.global.draw === "ERASE") {
            this.Render.saveReRender(prevscaledx, prevscaledy, scaledx, scaledy);
            this.Render.drawline(
                this.global.prevTouch0x,
                this.global.prevTouch0y,
                this.global.touch0x,
                this.global.touch0y,
                (this.global.draw === "DRAW" ? this.global.strokeStyle : this.global.boardColor),
                (this.global.draw === "DRAW" ? this.global.strokeWidth : (this.global.strokeWidth * 10)),
            );
        }
        if (this.global.draw === "PAN") {
            this.global.offsetX += (this.global.touch0x - this.global.prevTouch0x) / this.global.scale;
            this.global.offsetY += (this.global.touch0y - this.global.prevTouch0y) / this.global.scale;
            this.Render.redrawCanvas();
        }
        if (this.global.draw === "SQUARE") {
            this.global.shapeX = this.global.touch0x;
            this.global.shapeY = this.global.touch0y;
            this.Render.redrawCanvas();
        }
        if (this.global.draw === "OnShape") {
            this.global.drawing[this.global.shape_index].data.x +=
                (this.global.touch0x - this.global.prevTouch0x) / this.global.scale;
                this.global.drawing[this.global.shape_index].data.y +=
                (this.global.touch0y - this.global.prevTouch0y) / this.global.scale;
            this.Render.redrawCanvas();
        }
    }
    if (this.listners.doubleTouche) {
        // important
        // get second coordinate curr and pevious
        this.global.touch1x = e.touches[1].pageX;
        this.global.touch1y = e.touches[1].pageY;
        this.global.prevTouch1x = this.global.prevTouches[1].pageX;
        this.global.prevTouch1y = this.global.prevTouches[1].pageY;
        // get mid point for curr and previous
        const midx = (this.global.touch0x + this.global.touch1x) / 2;
        const midy = (this.global.touch0y + this.global.touch1y) / 2;
        const prevmidx = (this.global.prevTouch0x + this.global.prevTouch1x) / 2;
        const prevmidy = (this.global.prevTouch0y + this.global.prevTouch1y) / 2;
        // calcualte distance between touches
        const hypot = Math.sqrt(
            Math.pow(this.global.touch0x - this.global.touch1x, 2) +
            Math.pow(this.global.touch0y - this.global.touch1y, 2)
        );
        const prevHypot = Math.sqrt(
            Math.pow(this.global.prevTouch0x - this.global.prevTouch1x, 2) +
            Math.pow(this.global.prevTouch0y - this.global.prevTouch1y, 2)
        );
        // calcuate screen scale values
        var zoomAmount = hypot / prevHypot;
        this.global.scale *= zoomAmount; // change scale
        const scaleAmount = 1 - zoomAmount; // how much we have scale since zoomount is always between 0 to 1
        //cal how many pixel to be move in x and y dir
        const panX = midx - prevmidx; // deltx
        const panY = midy - prevmidy; // delyy
        //scale this based on zoom level
        this.global.offsetX += panX / this.global.scale; // make changes to global x
        this.global.offsetY += panY / this.global.scale; // make changes to global y
        //get realtive position of zoom
        var zoomRatioX = midx / this.global.canvas.clientWidth; // curr position of x according to scale
        var zoomRatioY = midy / this.global.canvas.clientHeight; // curr position of y according to scale
        const unitZoomedX = this.Render.trueWidth() * scaleAmount; // how much zoom in x
        const unitZoomedy = this.Render.trueHeight() * scaleAmount; // how much zoom in y
        const unitLeft = unitZoomedX * zoomRatioX; // cal curr left
        const unitTop = unitZoomedy * zoomRatioY; // cal curr top
        this.global.offsetX += unitLeft; // add to gobal
        this.global.offsetY += unitTop;
        this.Render.redrawCanvas(); // redraw
    }
    this.global.prevTouches[0] = e.touches[0];
    this.global.prevTouches[1] = e.touches[1];
},

 panMove : (x1, y1, x0, y0) => {
    // need for improvements
    let time = new Date().getTime() - this.global.downTime;
    let velocity = (Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2))) / time;
    let speedIndex = 3;
    this.global.accX = ((x1 - x0)) / time;
    this.global.accY = ((y1 - y0)) / time;
    this.global.accX *= speedIndex;
    this.global.accY *= speedIndex;
    this.global.accX *= Math.abs(velocity / this.global.scale);
    this.global.accY *= Math.abs(velocity / this.global.scale);
    this.global.raf = requestAnimationFrame(this.listners.accPan);
    setTimeout(() => { cancelAnimationFrame(this.global.raf); }, 200); // to stop infinite Acceleration
},
 accPan :() => {
    this.global.offsetX += this.global.accX;
    this.global.offsetY += this.global.accY;
    this.global.accX *= 0.89;
    this.global.accY *= 0.89;
    this.Render.redrawCanvas();
    this.global.raf = requestAnimationFrame(this.listners.accPan);
},

 iS_on_Shape :(x, y, shape)=> {
    if (shape.type === "SQUARE") {
        let shape_left = this.Render.toscreenX(shape.data.x);
        let shape_right = this.Render.toscreenX(shape.data.x) + this.Render.currWidth(shape.data.width);
        let shape_top = this.Render.toscreenY(shape.data.y);
        let shape_bottom = this.Render.toscreenY(shape.data.y) + this.Render.currHeight(shape.data.height);
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
    return false;
}
  }

  render() {
    return (
        <>
        <Header global = {this.global} />
        <ToolBox global = {this.global} Render = {this.Render}/>
        < canvas id = "board" > Board </canvas> </>
    )
  }
}
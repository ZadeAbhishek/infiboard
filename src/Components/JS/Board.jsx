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
        drawing: [],
        shapes:  [],
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
        undoStack: [],
        redoStack: [],
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
    // this.global.canvas.addEventListener("mousedown", this.listners.mouseDown);
    // this.global.canvas.addEventListener("mouseup", this.listners.mouseUp, false);
    // this.global.canvas.addEventListener("mousemove", this.listners.mouseMove, false);
    // this.global.canvas.addEventListener("wheel", this.listners.mouseWheel, false);
    // this.global.canvas.addEventListener("touchstart", this.listners.touchStart);
    // this.global.canvas.addEventListener("touchend", this.listners.touchEnd);
    // this.global.canvas.addEventListener("touchmove", this.listners.touchMove);
    const c = this.global.canvas;
  c.addEventListener("pointerdown", this._onPointerDown);
  c.addEventListener("pointermove", this._onPointerMove);
  c.addEventListener("pointerup",   this._onPointerUp);
  c.addEventListener("pointercancel",this._onPointerUp);
  c.addEventListener("pointerleave", this._onPointerUp);
  c.addEventListener('dblclick', this.listners.onDoubleClick);
  c.addEventListener("wheel", this.listners.mouseWheel, false);
    this._snapshot();
  }

  _snapshot() {
    // push a deep copy of current drawing onto undoStack
    this.global.undoStack.push(JSON.parse(JSON.stringify(this.global.drawing)));
    // clear redo whenever a brand new action occurs
    this.global.redoStack = [];
  }

  undo = () => {
    console.log("chekc");
    const { undoStack, redoStack, drawing } = this.global;
    if (undoStack.length < 2) return;          // nothing to undo
    // pop current state into redo
    redoStack.push(undoStack.pop());
    // restore previous
    this.global.drawing = JSON.parse(JSON.stringify(undoStack[undoStack.length - 1]));
    this.Render.redrawCanvas();
  }

  redo = () => {
    const { undoStack, redoStack } = this.global;
    if (!redoStack.length) return;
    // move top of redo back into undo and restore it
    const next = redoStack.pop();
    undoStack.push(JSON.parse(JSON.stringify(next)));
    this.global.drawing = JSON.parse(JSON.stringify(next));
    this.Render.redrawCanvas();
  }

  _onPointerDown = (e) => {
    if (!e.isPrimary) return;
    // prevent default on the real pointer event
    e.preventDefault();
  
    // build a minimal event-like object for your existing mouseDown
    const fake = {
      button: 0,                      // treat every pointerdown as left-click
      clientX: e.clientX,
      clientY: e.clientY,
      preventDefault: () => {},       // no-op, we've already called e.preventDefault()
    };
  
    this.listners.mouseDown(fake);
  };
  
  _onPointerMove = (e) => {
    if (!e.isPrimary) return;
    e.preventDefault();
    this.listners.mouseMove(e);      // mouseMove only reads clientX/clientY
  };
  
  _onPointerUp = (e) => {
    if (!e.isPrimary) return;
    e.preventDefault();
    this.listners.mouseUp(e);
  };

  Render = {
    // Function to redraw the canvas
    redrawCanvas: () => {
        const { canvas, context, boardColor, drawing, scale } = this.global;
    
        // 1) Resize & clear
        canvas.width  = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        context.globalCompositeOperation = "source-over";
        context.fillStyle = boardColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        // 2) Replay everything
        drawing.forEach(item => {
          if (item.type === "DRAW") {
            // normal draw
            context.globalCompositeOperation = "source-over";
            item.data.forEach(line => {
              context.beginPath();
              context.lineCap   = "round";
              context.lineJoin  = "round";
              context.lineWidth = line.lineWidth * scale;
              context.moveTo(
                this.Render.toscreenX(line.x0),
                this.Render.toscreenY(line.y0)
              );
              context.lineTo(
                this.Render.toscreenX(line.x1),
                this.Render.toscreenY(line.y1)
              );
              context.strokeStyle = line.strokeStyle;
              context.stroke();
            });
          }
          else if (item.type === "ERASE") {
            // no need to draw just forgot
          }
          else if (item.type === "SQUARE") {
            
            this.Render.reDrawShape(item);
          }
        });
    
        // 3) Draw the “in progress” square if any
        if (
          this.global.draw === "SQUARE" &&
          this.global.shapeX &&
          this.global.shapeY
        ) {
          this.Render.drawShape();
        }
      },

// Function to redraw a square shape
reDrawShape: (shape) => {
    const ctx  = this.global.context;
    const data = shape.data;
    const hs   = 8; // handle size
  
    // 1) Compute screen coords and scaled width/height (may be negative)
    const xScr = this.Render.toscreenX(data.x);
    const yScr = this.Render.toscreenY(data.y);
    const wScr = this.Render.currWidth(data.width);
    const hScr = this.Render.currHeight(data.height);
  
    // 2) Figure out top‐left corner and absolute extents
    const x0   = wScr >= 0 ? xScr       : xScr + wScr;
    const y0   = hScr >= 0 ? yScr       : yScr + hScr;
    const wAbs = Math.abs(wScr);
    const hAbs = Math.abs(hScr);
  
    // 3) Draw fill and border (negative dims draw just fine)
    ctx.save();
    ctx.fillStyle   = data.fillColor   ?? data.color   ?? '#000';
    ctx.fillRect(xScr, yScr, wScr, hScr);
  
    ctx.lineWidth   = data.borderWidth != null ? data.borderWidth : 2;
    ctx.strokeStyle = data.borderColor ?? '#fff';
    ctx.strokeRect(xScr, yScr, wScr, hScr);
  
    // 4) Draw text if any
    if (data.text) {
     ctx.fillStyle = data.textColor ?? '#000';
     // parse out the base size and family, then scale the size
     const [ baseSize, ...family ] = (data.font || '16px sans-serif').split(' ');
     const num       = parseFloat(baseSize);
     const fontFamily= family.join(' ');
     const zoomed    = num * this.global.scale;
     ctx.font        = `${zoomed}px ${fontFamily}`;
      const lineH = parseInt(ctx.font, 10);
      const textY = y0 + (hAbs + lineH)/2;
      ctx.fillText(data.text, x0 + 4, textY);
    }
  
    // 5) Draw handles and **store** their true hit‐boxes
    const handles = [
      { name:'nw', x: x0,         y: y0 },
      { name:'ne', x: x0 + wAbs-hs, y: y0 },
      { name:'sw', x: x0,         y: y0 + hAbs-hs },
      { name:'se', x: x0 + wAbs-hs, y: y0 + hAbs-hs }
    ];
    data._handles = handles.map(h => ({ name:h.name, x:h.x, y:h.y, w:hs, h:hs }));
  
    handles.forEach(h => {
      ctx.fillStyle   = '#fff';
      ctx.fillRect(h.x, h.y, hs, hs);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(h.x, h.y, hs, hs);
    });
  
    ctx.restore();
  },
  drawShape: () => {
    const ctx = this.global.context;
    const { downX, downY, shapeX, shapeY, strokeStyle } = this.global;
  
    // 1) Compute top-left and size so dragging in any direction works
    const x = Math.min(downX, shapeX);
    const y = Math.min(downY, shapeY);
    const w = Math.abs(shapeX - downX);
    const h = Math.abs(shapeY - downY);
  
    // 2) Draw the fill + border
    ctx.save();
    ctx.fillStyle   = strokeStyle;   // your current fill color
    ctx.strokeStyle = '#fff';        // white border
    ctx.lineWidth   = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
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

pushShape: () => {
    
    // compute true coords of both corners
    const x0 = this.Render.totrueX(this.global.downX);
    const y0 = this.Render.totrueY(this.global.downY);
    const x1 = this.Render.totrueX(this.global.shapeX);
    const y1 = this.Render.totrueY(this.global.shapeY);
  
    // normalize
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
  
    this.global.state++;
    this.global.drawing.push({
      type: this.global.draw,
      state: this.global.state,
      data: {
        x,
        y,
        width:       w,
        height:      h,
        fillColor:   this.global.strokeStyle,
        borderColor: '#fff',
        borderWidth: 2,
        text:        '',
        font:        '16px sans-serif',
        textColor:   '#000',
      }
    });
  
    // reset
    this.global.draw   = 'HOLD';
    this.global.downX  = this.global.downY = 0;
    this.global.shapeX = this.global.shapeY = 0;
  
    this.Render.redrawCanvas();
    this._snapshot();
    
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

onDoubleClick:(e) => {
    // find the top‐most square under the cursor
    const idx = this.global.drawing.slice().reverse().findIndex(item => {
      if (item.type !== 'SQUARE') return false;
      return this.listners.iS_on_Shape(e.clientX, e.clientY, item);
    });
    if (idx === -1) return;
    const shape = this.global.drawing[this.global.drawing.length - 1 - idx].data;
  
    const userText = prompt('Enter text for this box:', shape.text);
    if (userText !== null) {
      shape.text = userText;
      this.Render.redrawCanvas();
    }
  },
  mouseDown: (e) => {
    e.preventDefault();
  
    // 1) remember whatever tool you were on
    this.global.prevState = this.global.draw;
  
    // 2) compute click coords relative to the canvas
    const rect   = this.global.canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
  
    // reset handle state
    this.global.resizeHandle = null;
  
    // 3) LEFT‐click: try to hit a shape
    if (e.button === 0) {
      this.listners.leftmouseDown  = true;
      this.listners.rightMouseDown = false;
  
      let hit = false;
      // walk shapes front‐to‐back
      for (let i = this.global.drawing.length - 1; i >= 0; i--) {
        const item = this.global.drawing[i];
        if (item.type === "SQUARE") {
          // shape bounds in screen coords
          const sx = this.Render.toscreenX(item.data.x);
          const sy = this.Render.toscreenY(item.data.y);
          const sw = this.Render.currWidth(item.data.width);
          const sh = this.Render.currHeight(item.data.height);
  
          if (
            localX >= sx && localX <= sx + sw &&
            localY >= sy && localY <= sy + sh
          ) {
            // we clicked inside this shape
            hit = true;
            this.global.draw        = "OnShape";
            this.global.shape_index = i;
  
            // now check its handles
            const handles = item.data._handles || [];
            for (let h of handles) {
              if (
                localX >= h.x && localX <= h.x + h.w &&
                localY >= h.y && localY <= h.y + h.h
              ) {
                // corner‐drag
                this.global.resizeHandle = h.name;
                break;
              }
            }
            break;
          }
        }
      }
  
      // if no shape was hit, restore your prior tool
      if (!hit) {
        this.global.draw = this.global.prevState;
      }
    }
    // 4) RIGHT‐click: erase preview
    else if (e.button === 2) {
      this.listners.leftmouseDown  = true;
      this.listners.rightMouseDown = true;
      this.global._oldStrokeStyle = this.global.strokeStyle;
      this.global.strokeStyle     = 'rgba(255,255,255,0.4)';
      this.global.draw            = "ERASE";
    }
  
    // 5) common: reset any pan momentum and record start coords
    cancelAnimationFrame(this.global.raf);
    this.global.downTime    = Date.now();
    this.global.accX        = 0;
    this.global.accY        = 0;
    this.global.cursorX     = e.clientX;
    this.global.cursorY     = e.clientY;
    this.global.prevcursorX = e.clientX;
    this.global.prevcursorY = e.clientY;
    this.global.downX       = e.clientX;
    this.global.downY       = e.clientY;
  },
  
  
  mouseUp: (e) => {
    // stop any in‐flight mouse dragging
    this.listners.leftmouseDown  = false;
    this.listners.rightMouseDown = false;
  
    const wasErase = this.global.draw === "ERASE";
    const didStroke = (this.global.draw === "DRAW" || wasErase)
                    && this.global.currState.length > 0;
    let erasePath = [];
  
    // 1) if we just drew or erased, push that stroke to history
    if (didStroke) {
      this.global.state++;
      this.global.drawing.push({
        type:  this.global.draw,           // "DRAW" or "ERASE"
        state: this.global.state,
        data:  [...this.global.currState], // copy the segments
      });
      // capture the path for erase filtering
      if (wasErase) erasePath = [...this.global.currState];
      // clear your temp segments
      this.global.currState = [];
    }
  
    // 2) if it was an erase, remove any bits/shapes it covered
    if (wasErase && erasePath.length) {
      this.global.drawing = this.global.drawing.filter(item => {
        // keep the erase stroke itself
        if (item.state === this.global.state && item.type === "ERASE") {
          return true;
        }
        // remove any square fully hit
        if (item.type === "SQUARE") {
          return !this.listners.isShapeErased(item.data, erasePath);
        }
        // for DRAW strokes, keep only the segments that survived
        if (item.type === "DRAW") {
          const kept = item.data.filter(seg =>
            !this.listners.isSegmentErased(seg, erasePath)
          );
          if (kept.length) {
            item.data = kept;
            return true;
          }
          return false;
        }
        return true;
      });
    }
  
    // 3) if we were in the SQUARE tool, finalize it
    if (this.global.draw === "SQUARE" && this.global.shapeX && this.global.shapeY) {
      this.Render.pushShape();
      // pushShape resets draw→"HOLD" and clears shapeX/shapeY and does its own redraw
    }
  
    // 4) if panning, apply momentum
    if (this.global.draw === "PAN") {
      this.listners.panMove(
        this.global.cursorX,
        this.global.cursorY,
        this.global.downX,
        this.global.downY
      );
    }
  
    // 5) restore whatever tool we had before mouseDown
    this.global.draw = this.global.prevState;
    if (this.global._oldStrokeStyle) {
      this.global.strokeStyle = this.global._oldStrokeStyle;
      delete this.global._oldStrokeStyle;
    }
  
    // 6) final redraw for any remaining changes
    this.Render.redrawCanvas();
    this._snapshot(); 
  },

  mouseMove: (e) => {
    // 0) If you’re not dragging, we still want hover feedback:
    const rect   = this.global.canvas.getBoundingClientRect();
    const mx     = e.clientX;
    const my     = e.clientY;
    let hovered  = false;
  
    for (let i = this.global.drawing.length - 1; i >= 0; i--) {
      const item = this.global.drawing[i];
      if (item.type === 'SQUARE' && this.listners.iS_on_Shape(mx, my, item)) {
        this.global.canvas.style.cursor = 'move';
        hovered = true;
        break;
      }
    }
    if (!hovered) {
      // If you’re in erase mode, maybe show the eraser cursor:
      this.global.canvas.style.cursor = this.global.draw === 'ERASE' ? 'crosshair' : 'default';
    }
  
    // 1) If nothing is down, we’re done
    if (!this.listners.leftmouseDown) return;
  
    // 2) Update cursor coords
    this.global.cursorX = mx;
    this.global.cursorY = my;
  
    // 3) Compute true coords for history
    const x0 = this.global.prevcursorX, y0 = this.global.prevcursorY;
    const x1 = mx,                 y1 = my;
    const scaledx     = this.Render.totrueX(x1);
    const scaledy     = this.Render.totrueY(y1);
    const prevscaledx = this.Render.totrueX(x0);
    const prevscaledy = this.Render.totrueY(y0);
  
    // ─── DRAW ───────────────────────────────────────
    if (this.global.draw === 'DRAW') {
      this.Render.saveReRender(prevscaledx, prevscaledy, scaledx, scaledy);
      this.Render.drawline(x0, y0, x1, y1, this.global.strokeStyle, this.global.strokeWidth);
    }
  
    // ─── ERASE ──────────────────────────────────────
    else if (this.global.draw === 'ERASE') {
      const ctx = this.global.context;
      const eraserSize = this.global.strokeWidth * 8;
  
      // a) clear & replay for an ephemeral preview
      this.Render.redrawCanvas();
  
      // b) preview stroke
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = this.global.strokeStyle;
      ctx.lineWidth   = eraserSize;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.restore();
  
      // c) actual punch-out
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      const dist = Math.hypot(x1 - x0, y1 - y0);
      if (dist < eraserSize / 2) {
        ctx.beginPath();
        ctx.arc((x0 + x1)/2, (y0 + y1)/2, eraserSize/2, 0, Math.PI*2);
        ctx.fill();
      } else {
        const steps = Math.ceil(dist / (eraserSize / 4));
        for (let i = 0; i <= steps; i++) {
          const t  = i/steps;
          const xi = x0 + (x1 - x0)*t;
          const yi = y0 + (y1 - y0)*t;
          ctx.beginPath();
          ctx.arc(xi, yi, eraserSize/2, 0, Math.PI*2);
          ctx.fill();
        }
      }
      ctx.restore();
  
      // d) record it
      this.Render.saveReRender(
        this.Render.totrueX(x0),
        this.Render.totrueY(y0),
        this.Render.totrueX(x1),
        this.Render.totrueY(y1)
      );
    }
  
    // ─── ONSHAPE (move or resize) ──────────────────
    else if (this.global.draw === 'OnShape') {
      const shape = this.global.drawing[this.global.shape_index].data;
      const dx    = (x1 - x0) / this.global.scale;
      const dy    = (y1 - y0) / this.global.scale;
  
      switch (this.global.resizeHandle) {
        case 'se':
          shape.width  += dx;
          shape.height += dy;
          break;
        case 'sw':
          shape.x      += dx;
          shape.width  -= dx;
          shape.height += dy;
          break;
        case 'ne':
          shape.y      += dy;
          shape.width  += dx;
          shape.height -= dy;
          break;
        case 'nw':
          shape.x      += dx;
          shape.y      += dy;
          shape.width  -= dx;
          shape.height -= dy;
          break;
        default:
          // plain move
          shape.x += dx;
          shape.y += dy;
      }
  
      this.Render.redrawCanvas();
    }
  
    // ─── PAN ────────────────────────────────────────
    else if (this.global.draw === 'PAN') {
      this.global.offsetX += (x1 - x0) / this.global.scale;
      this.global.offsetY += (y1 - y0) / this.global.scale;
      this.Render.redrawCanvas();
    }
  
    // ─── SQUARE PREVIEW ────────────────────────────
    else if (this.global.draw === 'SQUARE') {
      this.global.shapeX = x1;
      this.global.shapeY = y1;
      this.Render.redrawCanvas();
    }
  
    // 4) update previous coords
    this.global.prevcursorX = x1;
    this.global.prevcursorY = y1;
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

iS_on_Shape: (mx, my, item) => {
    // only care about squares
    if (item.type !== 'SQUARE') return false;
    const d = item.data;
    // screen coords + scaled size (may be negative)
    const xScr = this.Render.toscreenX(d.x);
    const yScr = this.Render.toscreenY(d.y);
    const wScr = this.Render.currWidth(d.width);
    const hScr = this.Render.currHeight(d.height);
  
    // compute true left/right, top/bottom
    const left   = Math.min(xScr, xScr + wScr);
    const right  = Math.max(xScr, xScr + wScr);
    const top    = Math.min(yScr, yScr + hScr);
    const bottom = Math.max(yScr, yScr + hScr);
  
    // check hit
    return mx >= left && mx <= right && my >= top && my <= bottom;
  },
isSegmentErased: (seg, erasePath) => {
    const { x0, y0, x1, y1 } = seg;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len2 = dx*dx + dy*dy;
    
    // If segment length is effectively zero, just check distance to endpoints
    if (len2 < 0.0001) {
      return erasePath.some(p => {
        const dist = Math.hypot(p.x0 - x0, p.y0 - y0);
        // Use the same eraserSize as in rendering (adjusted for scale)
        const eraserRadius = (this.global.strokeWidth * 8) / (2 * this.global.scale);
        return dist < eraserRadius;
      });
    }
    
    // Create a more natural eraser size
    const eraserRadius = (this.global.strokeWidth * 8) / (2 * this.global.scale);
    
    return erasePath.some(p => {
      // Project the erase point onto the segment line
      const t = ((p.x0 - x0)*dx + (p.y0 - y0)*dy) / len2;
      const tc = Math.max(0, Math.min(1, t)); // Clamp to segment
      
      // Find closest point on segment
      const projX = x0 + tc*dx;
      const projY = y0 + tc*dy;
      
      // Check if distance is within eraser radius
      const dist = Math.hypot(p.x0 - projX, p.y0 - projY);
      return dist < eraserRadius;
    });
  },
  
  // Improved shape erasing detection with better radius calculation
  isShapeErased: (shapeData, erasePath) => {
    const { x, y, width, height } = shapeData;
    
    // Get shape bounds
    const minX = Math.min(x, x + width);
    const maxX = Math.max(x, x + width);
    const minY = Math.min(y, y + height);
    const maxY = Math.max(y, y + height);
    
    // Get eraser radius in true coordinates (same as used in rendering)
    const eraserRadius = (this.global.strokeWidth * 8) / (2 * this.global.scale);
    
    // Consider a shape erased if an eraser point is near its border or inside it
    return erasePath.some(p => {
      // Check if point is inside or near the shape border
      const nearLeft = Math.abs(p.x0 - minX) < eraserRadius;
      const nearRight = Math.abs(p.x0 - maxX) < eraserRadius;
      const nearTop = Math.abs(p.y0 - minY) < eraserRadius;
      const nearBottom = Math.abs(p.y0 - maxY) < eraserRadius;
      
      // Check if point is inside shape (with eraser radius tolerance)
      const insideX = p.x0 >= minX - eraserRadius && p.x0 <= maxX + eraserRadius;
      const insideY = p.y0 >= minY - eraserRadius && p.y0 <= maxY + eraserRadius;
      
      // Return true if point is near border or inside
      return (insideX && insideY) || 
             (insideX && (nearTop || nearBottom)) ||
             (insideY && (nearLeft || nearRight));
    });
  },
}


  render() {
    return (
        <>
        <Header global = {this.global} />
        <ToolBox
          global={this.global}
          Render={this.Render}
          onUndo={this.undo}
          onRedo={this.redo}
        />
        < canvas id = "board" > Board </canvas> </>
    )
  }
}
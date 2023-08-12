// Initialize global variables
import varaible from "./variable";

let global = varaible();

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
export function reDrawShape(shape) {
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

export function drawShape() {
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

export function saveRerender(prevx, prevy, x, y) {
    global.currState.push({
        x0: prevx,
        y0: prevy,
        x1: x,
        y1: y,
        strokeStyle: global.strokeStyle,
        lineWidth: (global.draw === "DRAW" ? global.strokeWidth / global.scale : (global.strokeWidth * 10) / global.scale),
    });
}

export function pushShape() {
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

export function toscreenX(xTrue) {
    return (xTrue + global.offsetX) * global.scale;
}

export function toscreenY(yTrue) {
    return (yTrue + global.offsetY) * global.scale;
}
// screen to original coordinate
export function totrueX(xscreen) {
    return xscreen / global.scale - global.offsetX;
}

export function totrueY(yscreen) {
    return yscreen / global.scale - global.offsetY;
}

export function currHeight(height) {
    return height * global.scale;
}

export function currWidth(Width) {
    return Width * global.scale;
}

export function trueHeight() {
    return global.canvas.clientHeight / global.scale;
}

export function trueWidth() {
    return global.canvas.clientWidth / global.scale;
}

export function drawline(x0, y0, x1, y1, color, lineWidth) {
    global.context.beginPath();
    global.Path2d.moveTo(x0, y0);
    global.Path2d.lineTo(x1, y1);
    global.context.strokeStyle = color;
    global.context.lineWidth = lineWidth;
    global.context.stroke(global.Path2d);
}
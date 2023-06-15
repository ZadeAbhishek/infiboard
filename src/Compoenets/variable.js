let states = {
    projectName: 'untitled',
    draw: 'HOLD',
    focusCenter: false,
    drawing: [],
    cursorX: 0,
    cursorY: 0,
    prevcursorX: 0,
    prevcursorY: 0,
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
    canvas: document.getElementById("board"),
    strokeStyle: '#fff',
    strokeWidth: 2,
    boardColor: "#1f1f1f",
    state: 0,
    stack: null,


}

export default function varaible() {
    return states;
}


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
        if (this.data.length == 0) return null;
        let curr = this.data[0];
        this.data.reverse();
        this.data.pop();
        this.data.reverse();
        return curr;
    }
    print() {
        console.log(...this.data);
    }
}
// const Socket  = require("engine.io");

let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor= document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = [];     //data
let track = 0;                // represent which action from tracker Array

let mouseDown = false;

// API
let tool = canvas.getContext("2d");    //used to draw graphics

tool.strokeStyle = penColor;             // color
tool.lineWidth = penWidth;                  //width (thickness)
// tool.beginPath();                      // new graphic (path) (line)
// tool.moveTo(10, 10);                   // take start point of a line from here i.e. x-axis-> 10 and y-axis-> 10
// tool.lineTo(100, 150);                 // end point
// tool.stroke();                         //  fill color/graphic

// mousedown -> start new path, mousemove -> path fill (graphics)
canvas.addEventListener("mousedown", (e)=>{
    mouseDown = true;
    //  beginPath({
    //     x: e.clientX, 
    //     y: e.clientY
    //  })
    
    let data = {
        x: e.clientX, 
        y: e.clientY
    }
    // send data to server
    socket.emit("beginPath", data);
    
})

canvas.addEventListener("mousemove", (e) => {
    
    if(mouseDown){
        let data = {
            x: e.clientX, 
            y: e.clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth

        }
        socket.emit("drawStroke", data);
    }
})

canvas.addEventListener("mouseup", (e)=>{
    mouseDown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

undo.addEventListener("click", (e) => {
    if(track > 0) track--;
    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("redoUndo", data);

})
redo.addEventListener("click", (e)=>{
    if(track < undoRedoTracker.length-1 ) track++;
    // track action
    let trackObj = {
        trackValue: track,
        undoRedoTracker
    }
    undoRedoCanvas(trackObj);
})

function undoRedoCanvas(trackObj){
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;
    
    let url = undoRedoTracker[track];
    let img = new Image();    // creating new image reference element
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj){
    //  to perform new graphic (path) (line)
    tool.beginPath();                       
    
    // start point
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj){
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;

    // draw line max to x and max to y i.e end point  
    tool.lineTo(strokeObj.x , strokeObj.y);

    // to give/fill color into it
    tool.stroke();
    

}

pencilColor.forEach((colorElem)=>{
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor; 
    })

})

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e) => {
    if(eraserFlag){
       tool.strokeStyle = eraserColor; 
       tool.lineWidth = eraserWidth;
    }
    else{
        tool.strokeStyle = penColor; 
        tool.lineWidth = penWidth;

    }
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    //  data from server
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    drawStroke(data);
})

socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})
const  express = require("express");  // access
const socket =  require("socket.io");

const app = express();    // initializes and server ready

// Get access to index.html
app.use(express.static("public"));

let port = 3000;
let server = app.listen(port, () => {
    console.log("Listening to port" + port);
})


// Socket.io
let io = socket(server);

io.on("connection", (socket) => {
    console.log("Made socket connection");

    //received data
    socket.on("beginPath", (data) => {
        // data from frontend
        // now transfer data to all connected computers
        io.sockets.emit("beginPath", data);

})
socket.on("drawStroke", (data)=>{
    io.sockets.emit("drawStroke", data);
})

socket.on("redoUndo", (data)=>{
    io.sockets.emit("redoUndo", data);
})
})
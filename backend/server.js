const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

var users = new Array();

io.on("connection", (socket) => {
    socket.on("new_user_joined", (data) => {
        users.push({ socket: socket, data: data });
        socket.broadcast.emit("new_user_joined_receive", data);
    })

    socket.on("drawing_state_change", (data) => {
        socket.broadcast.emit("drawing_state_change_receive", data);
    })

    socket.on("disconnect", () => {

        const pos = users.map(e => e.socket).indexOf(socket);
        let curr_user = users[pos];
        users.splice(pos, 1);
        console.log(curr_user.data)
        socket.broadcast.emit("user_disconnected", curr_user.data);

    })
})

server.listen(8080, () => {
    console.log("Listing at 8080..........");
})
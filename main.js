const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const app = express();

const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

io.on("connection", (socket) => {
  console.log("new user connected", socket.id);
  socket.on('chat message', (msg) => {
    console.log(`new message: ${msg} from ${socket.id}`);

    // 发送给所有人包括自己
    // io.emit('chat message', 'new message');

    // 发送给其他用户
    socket.broadcast.emit('chat message', 'new message ' + msg)
  });
});

app.use(express.static("public"));

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
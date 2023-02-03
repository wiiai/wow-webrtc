const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

let sslOptions = {
  key: fs.readFileSync("./local/localhost+2-key.pem"), //里面的文件替换成你生成的私钥
  cert: fs.readFileSync("./local/localhost+2.pem"), //里面的文件替换成你生成的证书
};

const server = require("https").createServer(sslOptions, app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

const connections = {}

io.on("connection", (socket) => {
  socket.join(socket.id);

  connections[socket.id]= socket;
  console.log("a user connected " + socket.id);

  socket.broadcast.emit("user-online", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    socket.broadcast.emit("user-offline", socket.id);
  });

  socket.on('online-feedback', id => {
    if (connections[id]) {
      connections[id].emit("online-feedback", socket.id);
    }
  })

  // sdp 消息的转发
  socket.on("sdp", (data) => {
    console.log("sdp");
    console.log(data.description);
    socket.to(data.to).emit("sdp", {
      description: data.description,
      sender: data.sender,
    });
  });

  // candidates 消息的转发
  socket.on("ice candidates", (data) => {
    console.log("ice candidates:  ");
    console.log(data);
    socket.to(data.to).emit("ice candidates", {
      candidate: data.candidate,
      sender: data.sender,
    });
  });
});

server.listen(3001, () => {
  console.log(`Example app listening on port ${3000}`);
});

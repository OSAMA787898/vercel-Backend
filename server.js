const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = [];

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("join_room", (data) => {

    socket.join(data.room);

    if (!users.find(user => user.id === socket.id)) {
  users.push({
    id: socket.id,
    username: data.username,
    room: data.room
  });
}

    const roomUsers = users.filter((user) => user.room === data.room);

    io.to(data.room).emit("room_users", roomUsers);

  });

  socket.on("send_message", (data) => {
    io.in(data.room).emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", data);
  });

  socket.on("disconnect", () => {

    const index = users.findIndex(user => user.id === socket.id);

    if (index !== -1) {

      const room = users[index].room;

      users.splice(index, 1);

      const roomUsers = users.filter(user => user.room === room);

      io.to(room).emit("room_users", roomUsers);
    }

  });

});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
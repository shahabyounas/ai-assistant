const { io } = require("socket.io-client");

const socket = io("http://localhost:3001");

// socket.emit("message", emitMessage());
socket.emit("message", {
  message: "Please explain the UN Charter",
});
// socket.on("hello");

return socket;

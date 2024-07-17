const { io } = require("socket.io-client");

const socket = io("http://localhost:3001");

socket.emit("call", () => {
  console.log("hello world");
});

return socket;

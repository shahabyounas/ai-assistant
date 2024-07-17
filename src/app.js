require("./db/mongoose");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const authMiddleware = require("./middleware/auth");
const socketMiddleware = require("./middleware/socket.io");
const { loadLLM } = require("./llm");

//Add defautl Admin
// require("./seeds/userSeed");

//Model Routers
const userRouter = require("./routers/user");
const chatRouter = require("./routers/chat");
const messageRouter = require("./routers/message");

//Set up app
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;
const io = new Server(server);
require("./socket.io");
require("./middleware/socket.io")(io);
loadLLM();

//Set up cors
const corsOptions = {
  origin: process.env.CORS_LINK,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
//Convert coming data to JSON
app.use(express.json());

//Set up middleware
app.use(userRouter);
app.use(chatRouter);
app.use(messageRouter);
app.use(authMiddleware);

server.listen(port, () => {
  console.log("You are listening at port " + port);
});

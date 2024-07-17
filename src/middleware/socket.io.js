/**
 *
 * @param {*} io
 *
 * Socket Events
 * 1 - Receive Message
 * 2 - Generate new response
 * 3 - Response Start
 * 4 - Response Error
 * 5 - Response End
 */

const { LMStudioClient } = require("@lmstudio/sdk");
const { saveChatSocket } = require("../routers/chat");
const { saveMessagesSocket, getMessagesSocket } = require("../routers/message");
const Message = require("../models/message");
const Response = require("../models/messageReponse");
const client = new LMStudioClient();
const LLM_MODEL = "lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf";
// Export socket middleware
function socketMiddleware(io) {
  io.on("connection", socketConnection);
  io.on("error", socketError);
}

let socket;
function socketConnection(s) {
  console.log("socket is is connected...");

  socket = s;
  // Socket events listeners;
  socket.on("message", messageReceivedHandler);
  socket.on("generate-start-response", generateResponseHandler);
  socket.on("responseStart", responseStartHandler);
  socket.on("responseError", responseErrorHandler);
  socket.on("responseEnd", responseEndHandler);
}

function socketError() {}

async function generateResponseHandler(data) {
  const { question, userId, chatId } = data;

  if (!question || !chatId) {
    return null;
  }

  const chatHistory = [];
  let = message = {};
  let _chatId = chatId;
  if (!_chatId) {
    const chat = await saveChatSocket({
      titile: question.substring(0, 20),
      userId,
    });
    _chatId = chat["_id"];
    message = await saveMessagesSocket({
      chatId: chat["_id"],
      sender: "user",
      text: question,
    });
  } else {
    message = await saveMessagesSocket({
      chatId: _chatId,
      sender: "user",
      text: question,
    });
    const allMessages = await getMessagesSocket(chatId);

    chatHistory.push(
      ...allMessages.map((msg) => ({ role: msg.sender, content: msg.text }))
    );
  }

  chatHistory.push({ role: "user", content: question });
  await LLMHandler(chatHistory);

  async function LLMHandler(history = []) {
    const mymodel = await client.llm.get(LLM_MODEL);
    const prediction = mymodel.respond(history, {
      contextOverflowPolicy: "stopAtLimit",
      maxPredictedTokens: 5000,
      stopStrings: ["\n"],
      temperature: 0.7,
      inputPrefix: "Q: ",
      inputSuffix: "\nA:",
    });

    for await (const text of prediction) {
      socket.emit("generate-response", { resp: text });
    }

    const { content } = await prediction;

    await new Response({
      content,
      messageId: message.id,
      chatId: _chatId,
      isComplete: true,
    }).save();
  }
}

async function messageReceivedHandler(data) {
  const mymodel = await client.llm.get(LLM_MODEL);
  const prediction = mymodel.respond(
    [{ role: "user", content: data.message }],
    {
      contextOverflowPolicy: "stopAtLimit",
      maxPredictedTokens: 5000,
      stopStrings: ["\n"],
      temperature: 0.7,
      inputPrefix: "Q: ",
      inputSuffix: "\nA:",
    }
  );

  let resp = "";
  for await (const text of prediction) {
    socket.emit("generate-response", { resp: text });
  }

  console.log(resp);
}

function responseStartHandler(data) {}

function responseErrorHandler(data) {}

function responseEndHandler(data) {}

module.exports = socketMiddleware;

const express = require("express");
const authMiddleware = require("../middleware/auth");
const Message = require("../models/message");
const { ObjectId } = require("mongodb");
const { createResponse } = require("./response");
const { handlePrompt } = require("./llm");
const router = express.Router();

router.get("/chat/:id/messages", [authMiddleware], getMessages);
router.get("/messages/:id", [authMiddleware], getMessageById);
router.post("/messages", [authMiddleware], saveMessages);
router.patch("/messages/:id", [authMiddleware], updateMessage);

async function getMessagesSocket(chatId) {
  if (!chatId) {
    // throw 'Please send chatId'
    return null;
  }
  const messages = await Message.find({ chatId }).sort({ createdAt: -1 });
  return messages;
}

async function getMessages(req, res) {
  const chatId = req.params.id;

  if (!chatId) {
    return res
      .status(404)
      .send("Please send the required keys e.g chatId, sender");
  }
  const messages = await Message.find({ chatId });
  return res.status(200).send(messages);
}

async function getMessageById(req, res) {
  const message = await Message.findOne({ _id: new ObjectId(req.params.id) });
  if (!message) {
    return res.status(404).send("Message not found!");
  }
  return res.status(200).send(message);
}

async function saveMessagesSocket(data) {
  try {
    const newMessage = new Message({
      chatId: data.chatId,
      sender: data.sender,
      text: data.text,
    });

    const sanitizedText = data.text.trim().replaceAll("\n", " ");

    newMessage["text"] = sanitizedText;

    const message = await newMessage.save();

    data.messageId = message["_id"];

    // Generate content here and save it in response
    // const content = handlePrompt({ question: message.text });
    // req.body.content = content;

    // const messageResp = await createResponse(req);

    return message;
  } catch (error) {
    return null;
  }
}

async function saveMessages(req, res) {
  try {
    const newMessage = new Message({
      chatId: req.body.chatId,
      sender: req.body.sender,
      text: req.body.text,
    });

    const sanitizedText = req.body.text.trim().replaceAll("\n", " ");

    newMessage["text"] = sanitizedText;

    const message = await newMessage.save();

    req.body.messageId = message["_id"];

    // Generate content here and save it in response
    const content = handlePrompt({ question: message.text });
    req.body.content = content;

    await createResponse(req);

    res.status(201).send(newMessage);
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).send({ errors });
    }
    res.status(500).send("Something went wrong");
  }
}

async function updateMessage(req, res) {
  const updatesAllowed = ["text"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    updatesAllowed.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  const filter = {
    _id: req.params.id,
  };

  const update = {
    title: req.body.text,
  };

  try {
    const updatedMessage = await Message.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });

    res.send(updatedMessage);
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).send({ errors });
    }
    res.status(500).send("Something went wrong!");
  }
}

module.exports = router;
module.exports.saveMessagesSocket = saveMessagesSocket;
module.exports.getMessagesSocket = getMessagesSocket;

const express = require("express");
const authMiddleware = require("../middleware/auth");
const Chat = require("../models/chat");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/chats", [authMiddleware], getChats);
router.get("/chats/:id", [authMiddleware], getChatById);
router.post("/chats", [authMiddleware], saveChat);
router.patch("/chats/:id", [authMiddleware], updateChat);
router.delete("/chats/:id", [authMiddleware], deleteChat);

async function getChats(req, res) {
  const chats = await Chat.find({}).sort({ updatedAt: -1 });
  const docCount = await Chat.countDocuments({});

  res.status(200).send({
    data: chats,
    total: docCount,
  });
}

async function getChatById(req, res) {
  const chat = await Chat.findOne({ _id: new ObjectId(req.params.id) });
  if (!chat) {
    res.status(404).send("Chat not found!");
  }
  res.status(200).send(chat);
}

async function saveChatSocket(data) {
  try {
    const newChat = new Chat({
      title: data.title,
      userId: data.userId,
    });

    const chat = await newChat.save();
    return chat;
  } catch (error) {
    return null;
  }
}

async function saveChat(req, res) {
  try {
    const newChat = new Chat({
      title: req.body.title,
      userId: "66967081916312af243edc3c",
    });

    await newChat.save();
    res.status(201).send(newChat);
  } catch (error) {
    console.log("error", error);
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

async function updateChat(req, res) {
  const updatesAllowed = ["title"];
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
    title: req.body.title,
  };

  try {
    const chat = await Chat.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });

    res.send(chat);
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

async function deleteChat(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.id });
    if (!chat) {
      return res.status(404).send("Chat Session not found!");
    }

    await Chat.deleteOne({ _id: req.params.id });
    res.status(200).send(chat);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
}

module.exports = router;
module.exports.saveChatSocket = saveChatSocket;

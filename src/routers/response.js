const express = require("express");
const authMiddleware = require("../middleware/auth");
const MessageResponse = require("../models/messageReponse");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/messages/:id/responses", [authMiddleware], getResponses);
router.get("/messages/:id/responses/:rid", [authMiddleware], getResponseById);
// router.post("/messages/:id/responses", [authMiddleware], createResponse);
router.patch("/messages/:id/responses/:id", [authMiddleware], updateResponse);

async function getResponses(req, res) {
  const messageId = req.params.id;

  if (!messageId) {
    res.status(404).send("Please send the required keys e.g chatId, messageId");
  }
  const messages = await MessageResponse.find({ messageId });
  res.status(200).send(messages);
}

async function getResponseById(req, res) {
  const responseId = req.params.rid;
  const messageId = req.params.id;

  if (!responseId || !messageId) {
    res
      .status(404)
      .send("Please send the required keys,responseId and messageId");
  }
  const messageResponse = await MessageResponse({
    _id: new ObjectId(responseId),
    messageId: new ObjectId(messageId),
  });
  if (!messageResponse) {
    res.status(404).send("Message response not found!");
  }
  res.status(200).send(messageResponse);
}

async function createResponse(req, res) {
  try {
    const reqBody = req.body;
    console.log("reqbody", reqBody);
    const newMessageResponse = new MessageResponse({
      chatId: reqBody.chatId,
      messageId: reqBody.messageId,
      content: reqBody.content,
    });

    const sanitizedText = reqBody.content.trim().replaceAll("\n", " ");

    newMessageResponse["content"] = sanitizedText;

    const respStored = await newMessageResponse.save();
    return respStored;
    // res.status(201).send({newMessageResponse});
  } catch (error) {
    console.log(error);
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

async function updateResponse(req, res) {
  const updatesAllowed = ["content"];
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
    content: req.body.content,
  };

  try {
    const updatedMessageResponse = await MessageResponse.findOneAndUpdate(
      filter,
      update,
      {
        returnOriginal: false,
      }
    );

    res.send(updatedMessageResponse);
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

module.exports.router = router;
module.exports.createResponse = createResponse;

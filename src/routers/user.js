const express = require("express");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const User = require("../models/user");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.post("/users/login", userLogin);
router.get("/users", [authMiddleware], getUsers);
router.get("/users/:id", [authMiddleware], getUserById);
router.post("/users", [authMiddleware], saveUser);
router.patch("/users/:id", [authMiddleware], updateUser);
router.patch("/users/:id/password", [authMiddleware], updatePassword);
router.delete("/users/:id", [authMiddleware], deleteUser);
router.post("/users/login/token", loginToken);
router.post("/users/logout", [authMiddleware], logout);
router.post("/users/logout/all", [authMiddleware], logoutAll);

async function userLogin(req, res) {
  try {
    //Find User
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    //Generate a token
    const token = await user.generateAuthToken();

    //Return token
    res.status(200).send({ user, token });
  } catch (error) {
    console.log("error", error);
    res.status(400).send(error.message);
  }
}

async function getUsers(req, res) {
  const users = await User.find({ isAdmin: false });
  res.status(200).send(users);
}

async function getUserById(req, res) {
  const user = await User.findOne({ _id: ObjectId(req.params.id) });
  if (!user) {
    res.status(404).send("User not found!");
  }
  res.status(200).send(user);
}

async function saveUser(req, res) {
  try {
    const newUser = new User({
      name: req.body.name,
      mobile: req.body.mobile,
      email: req.body.email,
      password: req.body.password,
    });

    await newUser.save();
    res.status(201).send(newUser);
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

async function updateUser(req, res) {
  const updatesAllowed = ["name", "mobile"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    updatesAllowed.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  try {
    updates.forEach((updateKey) => {
      req.user[updateKey] = req.body[updateKey];
    });

    await req.user.save();

    res.send(req.user);
  } catch (error) {
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

async function updatePassword(req, res) {
  try {
    const isMatch = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );

    if (!isMatch) {
      throw new Error("Incorrect old password!");
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      throw new Error("New password and confirm password do not match!");
    }

    req.user.password = req.body.newPassword;
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).send("User not found!");
    }
    await user.delete();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
}

async function loginToken(req, res) {
  try {
    const user = await User.findByToken(req.body.token);

    if (!user) {
      return res.status(400).send({ error: "Please authenticate!" });
    }

    res.status(200).send({ user });
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function logout(req, res) {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
}

async function logoutAll(req, res) {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
}

module.exports = router;

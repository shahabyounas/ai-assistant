const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    // const token = req.header("Authorization").replace("Bearer ", "");
    // const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    // const user = await User.findOne({
    //   _id: decodedToken._id,
    //   "tokens.token": token,
    // });
    // if (!user) {
    //   throw new Error();
    // }
    // req.user = user;
    // req.token = token;

    next();
  } catch (error) {
    return res.status(401).send("Please authenticate!");
  }
};

module.exports = authMiddleware;

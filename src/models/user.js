const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
      validate(email) {
        if (!validator.isEmail(email)) {
          throw new Error("Please enter a valid email!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to authenticate");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to authenticate");
  }

  return user;
};

userSchema.statics.findByToken = async (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  const user = await User.findOne({
    _id: decodedToken._id,
    "tokens.token": token,
  });
  if (!user) {
    throw new Error();
  }

  // const user = await User.findOne({ email })
  // if (!user) {
  //     throw new Error('Unable to authenticate')
  // }
  // const isMatch = await bcrypt.compare(password, user.password)
  // if (!isMatch) {
  //     throw new Error('Unable to authenticate')
  // }

  return user;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  // delete userObject.email
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

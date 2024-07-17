const User = require("../models/user");

const makeNewAdmin = async () => {
  const newAdmin = new User({
    isAdmin: true,
    name: "admin",
    mobile: "0741234567",
    email: "admin@ai.com",
    password: "adminai",
  });

  await newAdmin.save();
  return;
};

makeNewAdmin()
  .then((response) => {
    console.log("Admin created");
  })
  .catch((error) => {
    console.log(error);
  });

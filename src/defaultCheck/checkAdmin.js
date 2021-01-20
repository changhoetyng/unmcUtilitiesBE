const User = require("../model/User");
const bcrypt = require("bcrypt");

var defaultAdmin = {
  username: "admin",
  password: "admin",
  role: "admin",
};

module.exports = {
  checkAdmin: async () => {
    try {
      const user = await User.findOne({ role: "admin" });
      if (!user) {
        //Encrypt
        const salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(
          defaultAdmin.password,
          salt
        );

        await User.create({
            username: defaultAdmin.username,
            encryptedPassword: encryptedPassword,
            role: defaultAdmin.role,
        })
        console.log("Admin created")
      }
    } catch (err) {
      console.log(err);
    }
  },
};

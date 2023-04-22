const User = require("../model/User");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

const handleNewUser =
  (body("email").isEmail(),
  // password must be at least 5 chars long
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return { status: 400, message: "Username and password are required." };
    }
    const { email, password, name, surname, studentNumber, roles } = req.body;
    if (!email || !password)
      return { status: 409, message: "Email already exists" };

    // username must be an email

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) return { status: 409, message: "Email already exists" }; //Conflict

    try {
      //encrypt the password
      const hashedPwd = await bcrypt.hash(password, 10);

      //create and store the new user
      const result = await User.create({
        email: email,
        password: hashedPwd,
        name: name,
        surname: surname,
        studentNumber: studentNumber,
        roles: roles,
      });

      console.log(result);

      return { status: 201, message: `New user ${email} created!` };
    } catch (err) {
      return { status: 500, message: err.message };
    }
  });

module.exports = { handleNewUser };

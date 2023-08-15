const express = require('express');
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const router = express.Router();

// REGISTER

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = new User({
    username: username,
    email: email,
    password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString()
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  }
  catch(error) {
    res.status(500).json(error);
  }
});

// LOGIN

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      username: username
    });

    if(!user) {
      res.status(401).json('Wrong Credentials');
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    const userPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if(userPassword !== password) {
      res.status(401).json('Wrong Password');
    }

    const accessToken = jwt.sign({
      id: user._id,
      isAdmin: user.isAdmin
    }, process.env.JWT_SEC, { expiresIn: '3d' });

    const { pass, ...others } = user._doc;

    res.status(201).json({ ...others, accessToken });
  }
  catch(error) {
    res.status(500).json(error);
  }
})

module.exports = router;
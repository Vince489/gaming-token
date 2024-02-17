const express = require('express');
const router = express.Router();

const UserRoutes = require("./../domains/user");
const AuthRoutes = require("./../domains/authState");


router.use('/user', UserRoutes);
router.use('/auth', AuthRoutes);


module.exports = router;

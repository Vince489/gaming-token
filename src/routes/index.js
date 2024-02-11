const express = require('express');
const router = express.Router();

const UserRoutes = require("./../domains/user");


router.use('/user', UserRoutes);


module.exports = router;

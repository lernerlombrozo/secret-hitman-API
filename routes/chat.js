
const express = require('express');
const isAuth = require('../middleware/is-auth');

const chatController = require('../controllers/chat');
const router = express.Router();

router.post('/new-message', isAuth, chatController.newMessage);
router.post('/history', isAuth, chatController.newHistoryMessage);
router.get("/get-chat", isAuth, chatController.getChat);

module.exports = router;
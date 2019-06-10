const Chat = require("../models/chat");
const io = require("../socket");

exports.newMessage = (req, res, next) => {
    console.log('new message!')
    const gameId = req.body.gameId;
    const userId = req.userId;
    const message = {
        message: req.body.message,
        player: userId,
        date: new Date()
    };
    Chat.findOne({gameId: gameId})
        .then(chat => {
            if(!chat){
                chat = new Chat({
                  gameId: gameId,
                  messages: [
                      message
                  ]
                });
            } else {
                chat.messages.push(message)
            }
            return chat.save()
        })
        .then(chat => {
            return Chat.findOne({ gameId: gameId })
                .populate({ path: 'messages.player', select: 'name' })
            
        })
        .then(chat =>{
            io.getIo().emit(`game/chat/${gameId}`, {
                action: 'new-message',
                chat: chat
            })
            res.status(201).json({
                message: 'Message created!!!',
                chat: chat,
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}

exports.newHistoryMessage = (req, res, next) => {
	console.log('new history message!')
	const gameId = req.body.gameId;
	const message = {
		message: req.body.message,
		date: new Date()
	};
	Chat.findOne({ gameId: gameId })
		.then(chat => {
			if (!chat) {
				chat = new Chat({
					gameId: gameId,
					messages: [
						message
					]
				});
			} else {
				chat.messages.push(message)
			}
			return chat.save()
		})
		.then(chat => {
			return Chat.findOne({ gameId: gameId })
				.populate({ path: 'messages.player', select: 'name' })

		})
		.then(chat => {
			io.getIo().emit(`game/chat/${gameId}`, {
				action: 'new-message',
				chat: chat
			})
			res.status(201).json({
				message: 'Message created!!!',
				chat: chat,
			})
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		})

}

exports.getChat = (req, res, next) => {
    const gameId = req.query.gameId;
    Chat.findOne({ gameId: gameId })
        .populate({ path: 'messages.player', select: 'name' })
        .then(chat => {
            if (!chat) {
                const error = new Error('Chat not found!!!');
                error.statusCode = 404;
                throw error;
            } 
            res.status(200).json({
                message: "fetched chat!!!",
                chat: chat,
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}
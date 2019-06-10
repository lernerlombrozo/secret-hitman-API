
const { validationResult } = require('express-validator/check');

const Game = require('../models/game');
const Chat = require('../models/chat')
const User = require('../models/user');

const io = require('../socket');

const historyMode = true; 

var newDeck = (cards = [
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "fascist",
    "liberal",
    "liberal",
    "liberal",
    "liberal",
    "liberal",
    "liberal"
]);

exports.getGames = (req, res, next) => {
    const userId = req.userId;
    console.log(userId)
    const currentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Game.find({
        $or: [
            {
                $and: [{
                    "players.9": { "$exists": false }
                },
                { started: false }
                ]
            },
            { 'players.player': userId }
        ]
    })
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Game.find({
                $or: [
                    {
                        $and: [{
                            "players.9": { "$exists": false }
                        },
                        { started: false }
                        ]
                    },
                    { 'players.player': userId }
                ]
            })
                .populate('creator')
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
                .select('players')
        })
        .then(games => {
            if (!games) {
                const error = new Error('No games found!!!');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: "fetched games!!!",
                games: games,
                totalItems: totalItems
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.createGame = (req, res, next) => {
    console.log('creating game!!!')
    const userId = req.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect!!!');
        error.statusCode = 422;
        throw error;
    }
    let creator;
    let gameId;
    const game = new Game({
        players:[{
            player: userId,
            order: null, // 1 to number of players
            role: null, // liberal, facist or hitler
            vote: null
        }],
        playerCount:1,
        creator: userId,
    })
    game.save()
        .then(result => {
            gameId=result._id;
            return User.findById(userId)
        })
        .then(user => {
            creator = user;
            user.games.push(game);
            return user.save()
        })
        .then(result => {
            return Game.findById(gameId)
                .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(game => {
            console.log('game created!!!');
			var players = game.players;
			writeHistory(gameId, `${players[0].player.name} started the game!`, true)
            io.getIo().emit(`game/${gameId}`, {
                action: 'create',
                game: game,
            })
            res.status(201).json({
                message: 'Game created!!!',
                game: game,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.createPopulatedGame = (req, res, next) => {
    console.log('creating populated game!!!')
    const userId = req.userId;
    const playerAmount = req.body.players;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect!!!');
        error.statusCode = 422;
        throw error;
    }
    let creator;
    let gameId;
    const game = new Game({
        players: [
            {
            player: userId,
            order: null, // 1 to number of players
            role: null, // liberal, facist or hitler
            vote: null
            }, {
                player: '5c7b2d65f37f7a377fb8271c',
                order: null, // 1 to number of players
                role: null, // liberal, facist or hitler
                vote: null
            },{
                player: '5c76ee7115ea297dadaf3d28',
                order: null, // 1 to number of players
                role: null, // liberal, facist or hitler
                vote: null
            }, {
                player: '5c7d582ce16a1624704c621c',
                order: null, // 1 to number of players
                role: null, // liberal, facist or hitler
                vote: null
            }, {
                player: '5c7d5812e16a1624704c621b',
                order: null, // 1 to number of players
                role: null, // liberal, facist or hitler
                vote: null
            }, {
                player: '5c7d58a3c5734124ae06825c',
                order: null, // 1 to number of players
                role: null, // liberal, facist or hitler
                vote: null
            }],
        playerCount: playerAmount,
        creator: userId,
    })
    if (playerAmount > 6){
        game.players.push({
          player: "5c7d5ae6f8888224dcecc182",
          order: null, // 1 to number of players
          role: null, // liberal, facist or hitler
          vote: null
        });
    } if (playerAmount > 7) {
        game.players.push({
          player: "5c7d7f3bc4666730d2706961",
          order: null, // 1 to number of players
          role: null, // liberal, facist or hitler
          vote: null
        });
    } if (playerAmount > 8) {
        game.players.push({
          player: "5c7d86c1833a973441734446",
          order: null, // 1 to number of players
          role: null, // liberal, facist or hitler
          vote: null
        });
    } if  (playerAmount > 9) {
        game.players.push({
          player: "5c7db4d5f90b993e57e3e89a",
          order: null, // 1 to number of players
          role: null, // liberal, facist or hitler
          vote: null
        });
      }
    game.save()
        .then(result => {
            gameId = result._id;
            return User.findById(userId)
        })
        .then(user => {
            creator = user;
            user.games.push(game);
            return user.save()
        })
        .then(result => {
            return Game.findById(gameId)
            .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(game => {
            console.log('populated game created!!!')
            io.getIo().emit(`game/${gameId}`, {
                action: 'create',
                game: game,
            })
            res.status(201).json({
                message: 'Game created!!!',
                game: game,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deleteGame = (req, res, next) => {
	// should also delete it's chat
	const gameId = req.body.gameId;
	console.log(gameId)
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect!!!');
		error.statusCode = 422;
		throw error;
	};
	if (!gameId) {
		const error = new Error('No game Id provided!!!');
		error.statusCode = 422;
		throw error;
	};
	Game.findByIdAndDelete(gameId)
		.then(() => {
			console.log('game: ', gameId, ' was deleted !!!')
			res.status(200).json({
				message: 'deleted Game!!!',
				game: gameId
			})
		})
		.catch(()=>{
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		})

}

///// Creating join Game. Need to make it unable to join game if already in game
exports.joinGame = (req, res, next) => {
    const gameId = req.body.gameId;
    const userId = req.userId;
    console.log('user: ', userId, ' is joining game: ', gameId, ' !!!')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect!!!');
        error.statusCode = 422;
        throw error;
    }
    Game.findById(gameId)
        .populate({ path: 'players.player', select: 'email name status' })
        .then(game => {
            if (!game) {
                const error = new Error('Game was not found!!!');
                error.statusCode = 404;
                throw error;
            }
            // the following if statement doesn't let a player join a game he is already in
            const existingPlayer = game.players.find(player => player.player._id.toString() === req.userId);
            if (existingPlayer) { 
                io.getIo().emit(`game/${gameId}`, {
                    action: 'player-rejoined',
                    game: game
                })
                res.status(200).json({
                    message: 'Rejoined Game!!!',
                    game: game
                })
            }else {
                if (game.players.length >= 10) {
                    const error = new Error('Reached maximum limit!!!');
                    error.statusCode = 403;
                    throw error;
                }
                if (game.started) {
                    const error = new Error('Game is already started!!!');
                    error.statusCode = 403;
                    throw error;
                }
                game.players.push({
                    player: userId,
                    role: null, // liberal, facist or hitler
                    vote: null
                })
                game.playerCount++;
                game.save()
                .then(result => {
                    return Game.findById(gameId)
                    .populate({ path: 'players.player', select: 'email name status' })
                })
                .then(result => {
					const players = result.players
					writeHistory(gameId, `${players[players.length - 1].player.name} has joined the game!`, true)
                    console.log('user: ', userId, ' joined game: ', gameId, '!!!')
                    io.getIo().emit(`game/${gameId}`, {
                        action: 'player-joined',
                        game: result
                    })
                    res.status(200).json({
                        message: 'Joined Game!!!',
                        game: result
                    })
                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                })
            }
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.startGame = (req, res, next) => {
    console.log('starting game')
    const gameId = req.body.gameId;
    const userId = req.userId;
    Game.findById(gameId)
      .populate({ path: "players.player", select: "email name status" })
      .then(game => {
        if (game.started) {
          const error = new Error("Game was already started!!!");
          error.statusCode = 409; // conflict
          throw error;
        }
        if (game.players.length < 5) {
          const error = new Error("Not enough players to start game!!!");
          error.statusCode = 409; // conflict
          throw error;
        }
        if (userId !== game.creator.toString()) {
            const error = new Error("Only game creator can start the game!!!");
            error.statusCode = 409; // conflict
            throw error;
        }
        var deck = newDeck;
        game.deck = shuffle(deck); //shuffle deck
        game.players = assignRoles(game.players); //assign roles and shuffles order
        game.president = Math.floor(Math.random() * game.players.length);;
        game.started = true;
        game.action = "nominate a chancellor";
        return game.save();
      })
      .then(result => {
        return Game.findById(gameId).populate({
          path: "players.player",
          select: "email name status"
        });
      })
      .then(game => {
		  writeHistory(gameId,`Game started, ${game.players[game.president].player.name} is president`, true);
        console.log("game started");
        io.getIo().emit(`game/${gameId}`, {
          action: "Game has started!",
          game
        });
        res.status(200).json({
          message: "Game Started!!!",
          game
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
}

exports.restartGame = (req, res, next) => {
    console.log("restarting game!!!");
    const userId = req.userId;
    const gameId = req.body.gameId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect!!!");
        error.statusCode = 422;
        throw error;
    }
    Game.findById(gameId)
        .then(game => {
            if (!game) {
                const error = new Error("Game was not found!!!");
                error.statusCode = 404;
                throw error;
            }
            var deck = newDeck;
            game.deck = shuffle(deck); //shuffle deck
            game.discarDeck = [];
            game.players = assignRoles(game.players); //assign roles and shuffles order
            game.president = Math.floor(Math.random() * game.players.length);
            game.chancellor = null;
            game.lastChancellor = null;
            game.lastPresident = null;
            game.started = true;
            game.allPlayersVoted = false;
            game.turn = 0;
            game.action = "nominate a chancellor";
            game.board = {
                fascist:  0,
                liberal: 0,
                electionTracker: 0
            } 
            game.started = true;
            game.finished = false;
            return game.save();
        })
        .then(result => {
            return Game.findById(gameId).populate({
                path: "players.player",
                select: "email name status"
            });
        })
        .then(game => {
            console.log('game restarted')
			writeHistory(gameId, `Game was restarted, ${game.players[game.president].player.name} is president`, true);
            io.getIo().emit(`game/${gameId}`, {
              action: "Game has been restarted!",
              game
            });
            res.status(200).json({
                message: "Game Restarted!!!",
                game
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


//////// Here start the game logic ////////

exports.proposeChancellor = (req, res, next) => {
    const gameId = req.body.gameId;
    const userId = req.userId;
    const newChancellor = req.body.chancellor;
    console.log(userId, 'is proposing chancellor: ', newChancellor)
    Game.findById(gameId)
        .then(game => {
            if (!game.started) {
                const error = new Error('Game has not been started!!!');
                error.statusCode = 409; // conflict
                throw error;
            } 
            if (game.action !== "nominate a chancellor"){
                const error = new Error('Cannot nominate right now!!!');
                error.statusCode = 409; // conflict
                throw error;
            }
            if (!isPresident(game, userId)) {
                const error = new Error('Only the president can elect!!!');
                error.statusCode = 409; // conflict
                throw error;
            }
            if (newChancellor === game.lastChancellor){
                const error = new Error('This player was chancellor last round. Choose another player!!!');
                error.statusCode = 409; // conflict
                throw error;
            }
            if (newChancellor === game.lastPresident && game.players.length>5){
                const error = new Error('This player was president last round. Choose another player!!!');
                error.statusCode = 409; // conflict
                throw error;
            }
            if (game.players[newChancellor].dead) {
                const error = new Error('This player is dead. Choose another player!!!');
                error.statusCode = 409; // conflict
                throw error;
            };
            game.allPlayersVoted = false;
            game.players.forEach(player => {
                player.vote = null;
            })
            game.players = makeAllVotes(game.players, null);
            game.chancellor=newChancellor;
            game.action = "vote";
            return game.save()
        })
        .then(result => {
            return Game.findById(gameId)
                .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(game => {
			writeHistory(
        gameId,
        `${game.players[game.president].player.name} elected ${
          game.players[game.chancellor].player.name
        }`,
        false
      );
            console.log("chancellor proposed: ", newChancellor);
            io.getIo().emit(`game/${gameId}`, {
              action: "Chancellor has been selected!",
              game
            });
            res.status(200).json({
                message: 'chancellor-selected!!!',
                game
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.vote = (req, res, next) => {
    const gameId = req.body.gameId;
    const newVote = req.body.vote;
    const userId = req.userId;
    var action = null;
    console.log(userId, ' is voting!!!')
    Game.findById(gameId)
        .then(game => {
            if (!game.started) {
                const error = new Error('Game has not been started!!!');
                error.statusCode = 409; // conflict
                throw error;
            } if (game.allPlayersVoted) {
                const error = new Error('Too Late my friend, All players have voted!!!');
                error.statusCode = 409; // conflict
                throw error;
            } if (game.action !== "vote"){
                const error = new Error('Not voting time!!!');
                error.statusCode = 409; // conflict
                throw error;
            }
            index = getPlayerIndex(game.players, userId)
            game.players[index].vote=newVote;
            game.allPlayersVoted = game.players.every(playerHasVoted)
            if (game.allPlayersVoted) {
                if(checkVoteAproved(game.players)){
                    game.lastChancellor = game.chancellor;
					game.temporaryPresident ? 
						game.lastPresident = game.temporaryPresident:
						game.lastPresident = game.president;
					if (game.turn > 3 && game.players[game.chancellor].role==="hitler"){
						game.action = "fascists win";
                        game.finished == true;
						action = game.action;
					}else {
						game.action = "president discards";
                    	action = "Chancellor Approved";
					}
                } else {
                    // Still need to see if game has been lost/won
                    game.action = "nominate a chancellor";
                    game.turn++;
					game.temporaryPresident = null;
                    game.president = shiftPresident(game.president, game.players);
                    game.chancellor = null;
                    action = "Chancellor Disapproved";
                    if (game.board.electionTracker < 3 ){
                        game.board.electionTracker ++
                    } else {
                        if (game.deck[0] === 'fascist'){
                            board.fascist ++;
                        } else {
                            board.liberal ++;
                        }
                        game.deck.shift();
                        game.board.electionTracker = 0;
                    }
                }
            }
            return game.save()
        })
        .then(result => {
            return Game.findById(gameId)
                .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(result => {
            console.log(userId, " voted!!!");
            io.getIo().emit(`game/${gameId}`, {
                action: action,
                game: result
            })
            res.status(200).json({
                message: 'you voted!!!',
                game: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


// only for god mode
exports.allVotes = (req, res, next) => {
    const gameId = req.body.gameId;
    const vote = req.body.vote;
    let action;
    console.log('all players voting ', vote , '!!!')
    Game.findById(gameId)
        .then(game => {
            if (!game.started) {
                const error = new Error('Game has not been started!!!');
                error.statusCode = 409; // conflict
                throw error;
            } if (game.allPlayersVoted) {
                const error = new Error('Too Late my friend, All players have voted!!!');
                error.statusCode = 409; // conflict
                throw error;
            }
            game.players = makeAllVotes(game.players, vote);
            if(vote){
                game.lastChancellor = game.chancellor;
                game.temporaryPresident ? 
					game.lastPresident = game.temporaryPresident:
					game.lastPresident = game.president;
                game.board.electionTracker = 0;
                game.allPlayersVoted = true;
				if (game.turn > 3 && game.players[game.chancellor].role==="hitler"){
						game.action = "fascists win";
                        game.finished == true;
						action = game.action;
					}else {
						game.action = "president discards";
                    	action = "Chancellor Approved";
					}
            }
            else {
                game.action = "nominate a chancellor";
				game.temporaryPresident = null;
                game.president = shiftPresident(game.president, game.players);
                game.turn++;
                game.chancellor = null;
                action = "Chancellor Disapproved";
                game.allPlayersVoted = true;
                if (game.board.electionTracker < 3) {
                    game.board.electionTracker++
                } else {
                    if (game.deck[0] === 'fascist') {
                        board.fascist++;
                    } else {
                        board.liberal++;
                    }
                    game.deck.shift();
                    game.board.electionTracker = 0;
                }
            }
            return game.save()
        })
        .then(result => {
            return Game.findById(gameId)
                .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(result => {
            console.log('all players voted ', vote, '!!!')
            io.getIo().emit(`game/${gameId}`, {
                action,
                game: result
            })
            res.status(200).json({
                message: 'All Players Voted!!!',
                game: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.discardPolicyTile = (req, res, next) => {
    const gameId = req.body.gameId;
    const card = req.body.card;
	const userId = req.userId;
    let character;
    console.log('discarding policy tile' , card, '!!!')
    Game.findById(gameId)
        .then(game => {
            if (!game.started) {
                const error = new Error('Game has not been started!!!');
                error.statusCode = 409; // conflict
                throw error;
            } if (game.action === "president discards" && card < 3 ) {
                if (!isPresident(game, userId)){
					const error = new Error("Only the president can discard!!!");
					error.statusCode = 409; // conflict
					throw error;
				}
                character = 'president';
                game.discarDeck.push(game.deck[card]);
                game.deck.splice(card, 1);
                game.action = "chancellor discards";
            } else if (game.action === "chancellor discards" && card < 2) {
                if (!isChancellor(game, userId)){
					const error = new Error("Only the chancellor can discard!!!");
					error.statusCode = 409; // conflict
					throw error;
				}
                character = 'chancellor';
                game.discarDeck.push(game.deck[card]);
                game.deck.splice(card, 1);
				const selectedCard = game.deck.shift();
				if (selectedCard==='fascist'){
                    game.board.fascist ++
                    if (game.playerCount < 7) {
                        console.log('5 or 6 players')
                        if (game.board.fascist < 3){
                            /////////////
							game.temporaryPresident = null;
                            game.president = shiftPresident(game.president, game.players);
                            game.chancellor = null;
                            game.turn++;
                            game.action = "nominate a chancellor";
                            //////////////
                        } else if(game.board.fascist === 3){
                            game.action = "president examines top 3 cards";
                        } else if (game.board.fascist === 4) {
                            game.action = "president kills";
                        } else if (game.board.fascist === 5) {
                            game.action = "president kills";
                        } else if (game.board.fascist === 6) {
                            game.action = "fascists win";
                            game.finished == true;
                        }
                    }else if (game.playerCount < 9) {
                            console.log('7 or 8 players')
                            if (game.board.fascist === 1) {
                                /////////////
								game.temporaryPresident = null;
                                game.president = shiftPresident(game.president, game.players);
                                game.chancellor = null;
                                game.turn++;
                                game.action = "nominate a chancellor";
                                //////////////
                            } else if (game.board.fascist === 2) {
                                game.action = "president investigates player";
                            } else if (game.board.fascist === 3) {
                                game.action = "president picks president";
                            } else if (game.board.fascist === 4) {
                                game.action = "president kills";
                            } else if (game.board.fascist === 5) {
                                game.action = "president kills";
                            } else if (game.board.fascist === 6) {
                                game.action = "fascists win";
                                game.finished == true;
                            }
                    } else {
                            console.log('9 or 10 players')
                            if (game.board.fascist === 1) {
                                game.action = "president investigates player";
                            } else if (game.board.fascist === 2) {
                                game.action = "president investigates player";
                            } else if (game.board.fascist === 3) {
                                game.action = "president picks president";
                            } else if (game.board.fascist === 4) {
                                game.action = "president kills";
                            } else if (game.board.fascist === 5) {
                                game.action = "president kills";
                            } else if (game.board.fascist === 6) {
                                game.action = "fascists win";
                                game.finished == true;
                            }
                    }
                }
				else if (selectedCard === 'liberal'){
                    	game.board.liberal ++;
                        ///////////////
						game.temporaryPresident = null;
                        game.president = shiftPresident(game.president, game.players);
                        game.chancellor=null;
                        game.turn ++;
                        ////////////////
                    if (game.board.liberal===5){
                        game.action = "liberals win";
						game.finnished = true;
                    } else {
                        game.action = "nominate a chancellor";
                    }
                }
                else {
                    const error = new Error(
                        "What the heck happened here???"
                    );
                    error.statusCode = 409; // conflict
                    throw error; 
                }
                if(game.deck.length<3){
                    game.deck = shuffle(game.deck.concat(
                      game.discarDeck
                    )); 
                    game.discarDeck=[];
                }
            } else {
                const error = new Error(
                  "You cannot discard cards right now!!!"
                );
                error.statusCode = 409; // conflict
                throw error;
              };
            return game.save()
        })
        .then(result => {
            return Game.findById(gameId)
                .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(result => {
            console.log('discarded policy tile', card, 'new action is', result.action ,'!!!')
            io.getIo().emit(`game/${gameId}`, {
                action: `The ${character} has discarded`,
                game: result
            })
            res.status(200).json({
                message: 'you discarded!!!',
                game: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.executeAction = (req, res, next) => {
    console.log("executing action!");
    const gameId = req.body.gameId;
	const userId = req.userId;
	let presidentName;
	let selectedPlayerName; // killed or investigated player
    var actionToShow='';
	var historyMessage = '';
	var examined = false;
    Game.findById(gameId).populate({
        path: "players.player",
        select: "email name status"
    })
        .then(game => {
			var chosePresident = false;
            if (game.action === "president kills"){
				historyMessage = " killed "
                if (game.players[req.body.selectedPlayer].dead) {
                    const error = new Error('Player is already Dead!!!');
                    error.statusCode = 409; // conflict
                    throw error;
                }
				if (!isPresident(game,userId)){
					const error = new Error("Only the president can kill!!!");
					error.statusCode = 409; // conflict
					throw error;
				}
          		game.players[req.body.selectedPlayer].dead = true;
                if (game.players[req.body.selectedPlayer].role==="hitler"){
                    game.action = "liberals win"; 
                } else {
                    actionToShow = `The president killed Hitler (${game.players[req.body.selectedPlayer]})`
                    game.action = "nominate a chancellor";
                }
            }
			else if (game.action === "president investigates player"){
				historyMessage = " investigated "
				if (game.players[req.body.selectedPlayer].dead) {
					const error = new Error('Player is already dead!!!');
					error.statusCode = 409; // conflict
					throw error;
				}
				if (game.players[game.president].knows.indexOf(req.body.selectedPlayer) >= 0){
					const error = new Error('You allready know this character!!!');
					error.statusCode = 409; // conflict
					throw error;	
				}
				if (!isPresident(game,userId)){
					const error = new Error("Only the president can investigate!!!");
					error.statusCode = 409; // conflict
					throw error;
				}
				game.players[game.president].knows.push(req.body.selectedPlayer);
                game.action = "nominate a chancellor";
            }
			else if (game.action === "president picks president"){
				historyMessage = " elected "
				if (game.players[req.body.selectedPlayer].dead) {
					const error = new Error('Player is already dead!!!');
					error.statusCode = 409; // conflict
					throw error;
				}
				if (!isPresident(game, userId)){
					const error = new Error("Only the president can elect presidential candidate!!!");
					error.statusCode = 409; // conflict
					throw error;
				}
				game.temporaryPresident = req.body.selectedPlayer;
                game.action = "nominate a chancellor";
				chosePresident=true;
            } else if (game.action === "president examines top 3 cards"){
				historyMessage = " examined top 3 cards"
				if (!isPresident(game, userId)){
					const error = new Error("Only the president can examine the top 3 cards!!!");
					error.statusCode = 409; // conflict
					throw error;
				}
                game.action = "nominate a chancellor";
				examined=true;
            }else {
				const error = new Error("It's not time for an executive action!!!");
				error.statusCode = 409; // conflict
				throw error;
			}
			presidentName = game.temporaryPresident && !chosePresident ? game.players[game.temporaryPresident].player.name : game.players[game.president].player.name;
			selectedPlayerName = !examined ? game.players[req.body.selectedPlayer].player.name : "";
			historyMessage = presidentName + historyMessage + selectedPlayerName;
			if (!chosePresident) {
				game.temporaryPresident = null;
				game.president = shiftPresident(game.president, game.players);
			}
            game.chancellor = null;
            game.turn++;
            return game.save();
        })
        .then(result => {
            return Game.findById(gameId)
                .populate({ path: 'players.player', select: 'email name status' })
        })
        .then(result => {
            console.log("Action executed!!!");
			writeHistory(gameId, historyMessage, true)
            io.getIo().emit(`game/${gameId}`, {
                action: `Executive action fulfilled`,
                game: result
            })
            res.status(200).json({
                message: 'You executed action',
                game: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

function shuffle(deck) {
    var currentIndex = deck.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = deck[currentIndex];
        deck[currentIndex] = deck[randomIndex];
        deck[randomIndex] = temporaryValue;
    }

    return deck;
};

function assignRoles(players){
    var roles = ['hitler', 'fascist', 'liberal', 'liberal', 'liberal']
    if (players.length > 5) {
        roles.push('liberal')
        if (players.length > 6) {
            roles.push('fascist')
            if (players.length > 7) {
                roles.push('liberal')
                if (players.length > 8) {
                    roles.push('fascist')
                    if (players.length > 8) {
                        roles.push('liberal')
                    }
                }
            }
        }
    }
    roles=shuffle(roles);
    for(player=0;player<players.length;player++){
        players[player].role = roles[player];
        players[player].vote = null;
        players[player].dead = false;
    }
    return players
}

function getPlayerIndex(players, playerId){
    return players.findIndex(player => player.player._id.toString() === playerId);
}

function getPlayerName(players, playerId) {
	userName = players.find(
		player => player.player._id.toString() === playerId
	).player.name;
	return userName;
}

function playerHasVoted(player) {
    return player.vote !== null;
}

function checkVoteAproved(players){
    i = 0;
    players.forEach(player => {
        if(player.vote){
            i++
        }
    });
    return i > (Math.floor(players.length / 2) + 1)
}

function makeAllVotes(players, vote){
    players.forEach(player=>{
        player.vote = vote;
    })
    return players;
}

function shiftPresident(president, players){
    if (president<players.length-1)
        president++
    else president = 0;
    if (players[president].dead){
        return shiftPresident(president,players)
    } else {
        return president;
    }
}

function isPresident(game, userId){
	player = getPlayerIndex(game.players, userId)
	if(game.temporaryPresident){
		return player === game.temporaryPresident;
	}
	return player === game.president;
}

function isChancellor(game, userId) {
  player = getPlayerIndex(game.players, userId);
  console.log({ player, chancellor: game.chancellor });
  return player === game.chancellor;
}

function writeHistory(gameId, msg, important=false){
	if(!important || !historyMode){
		return
	}
	console.log('new history message!')
	const message = {
		message:msg,
		date: new Date()
	};
	Chat.findOne({ gameId: gameId })
		.then(chat => {
			if (!chat) {
				console.log('noChat')
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
		})
		.catch(err => {
			console.log("Chat error should not give a response")
		})

}



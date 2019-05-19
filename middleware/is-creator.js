// is creator must allways be after is auth;
const Game = require('../models/game');

module.exports = (req, res, next) => {
    const gameId = req.body.gameId;
    const userId = req.userId;
    Game.findById(gameId)
        .then(game=>{
        if (userId !== game.creator._id.toString()){
            const err = new Error('Only creator is allowed!!');
            err.statusCode = 401;
            throw err 
        }
        next(err);
    })
}
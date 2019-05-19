const express = require('express');
const { body } = require('express-validator/check')

const gameController = require('../controllers/game');

const isAuth = require('../middleware/is-auth')
const isCreator = require('../middleware/is-creator')

const router = express.Router();

router.get('/all-games', isAuth, gameController.getGames);
router.post('/new-game', isAuth, gameController.createGame);
router.post('/new-populated-game', isAuth, gameController.createPopulatedGame)
router.put('/join', isAuth, gameController.joinGame);
router.put('/start', [isAuth/*, isCreator*/], gameController.startGame);
router.put("/restart", [isAuth /*, isCreator*/], gameController.restartGame);
router.put('/propose-chancellor', isAuth, gameController.proposeChancellor);
router.put('/vote', isAuth, gameController.vote);
router.put('/all-votes', isAuth, gameController.allVotes);
router.put('/discard-policy-tile', isAuth,  gameController.discardPolicyTile);
router.put("/executive-action", isAuth, gameController.executeAction);
router.post("/delete-game", isAuth, gameController.deleteGame);

module.exports = router;
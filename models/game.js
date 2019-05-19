const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema(
    {
        president: {
            type: Number,
            default: null
        },
        chancellor: {
            type: Number,
            default: null
        },
        players: [
            {
                player: {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                },
                // order:Number, // 1 to number of players eliminated couse will be the position in array
                role: String, // liberal, facist or hitler
                vote: Boolean, // in favor or against
                dead: {
                    type: Boolean,
                    default: false
                },
				knows: {
					type: [Number],
					defoult: []
				}
            }
        ],
        allPlayersVoted: {
            type: Boolean,
            default: false
        },
		temporaryPresident: {
            type: Number,
            default: null
        },
        playerCount: Number,
        turn: {
            type: Number,
            default: 0
        },
        deck: {
            type: [String],
            default: []
        },
        discarDeck: {
            type: [String],
            default: []
        },
        board: {
            fascist: {
                type: Number,
                default: 0
            }, //amount of passed fascist cards
            liberal: {
                type: Number,
                default: 0
            }, //amount of passed liberal cards
            electionTracker: {
                type: Number,
                default: 0
            } // 3 reveals policy
        },
        started: {
            type: Boolean,
            default: false
        },
        finished: {
            type: Boolean,
            default: false
        },
        lastChancellor: {
            type: Number,
            default: null
        },
        lastPresident: {
            type: Number,
            default: null
        },
        action: {
            type: String, // "Nominate a Chancellor", "Vote", "President discards", "Chancellor discards"
            default: null
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema)
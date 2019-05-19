const path = require('path')
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer'); // for receiving images much easier
const helmet = require('helmet'); // for adding secure headers
const compression = require("compression"); // for compressing CSS and JS
const morgan = require("morgan"); // to log data


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const chatRoutes = require('./routes/chat');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString()+ '-'+ file.originalname)
    }
});

const fileFilter = (req, file, cb) =>{
    if (
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg' 
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json());  //application/json

app.use(
    multer({
        storage:fileStorage,
        fileFilter: fileFilter
    }).single('image')
)

app.use('/images', express.static(path.join(__dirname, 'images')))

// CORS. change * to domains allowed separated by ,
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, fakeId');
    next()
})

app.use('/feed', feedRoutes);
app.use('/game', gameRoutes);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),{
	flags: 'a',
});

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream })); // often logging is done by our hosting providers
// error handling
app.use((error, req, res, next)=>{
    console.log('app.js: error handling; ', error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({message:message, data:data});
})

console.log("here", process.env.MONGO_USER);
// mongoDB_URI = `mongodb+srv://${password.user}:${password.catchFrace}@cluster0-wjbyl.mongodb.net/${password.databaseName}?retryWrites=true`;
mongoDB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wjbyl.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true`;

mongoose
    .connect(mongoDB_URI)
    .then(result => {
        console.log('connected to mongodb')
        const server = app.listen(process.env.PORT || 3000);
        const io = require('./socket').init(server)
        io.on('connection', socket =>{
            console.log('Client Connected')
            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
        })
    })
    .catch(err => {
        console.log('mongodb connection error', err);
    });

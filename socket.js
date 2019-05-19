let io;

module.exports = {
    init: httpServer =>{
        io = require('socket.io')(httpServer);
        return io;
    },
    getIo: () =>{
        if(!io){
            throw new error('Socket.io not initialized!!!')
        }
        return io
    }
}
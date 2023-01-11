export default function socketHandler(io) {
    io.on('connection', (socket) => {
        // handle input from remote
        socket.on('control', (message) => {
            console.log(message)
            const {key} = message
            // io.emit(key, message)
            io.emit('control', message)
            io.emit('control-'+key, message)

        })
    
        socket.on('custom-message', (message) => {
            console.log('custome message')
            if (message.key){
                console.log('message')
                console.log('key ' + message.key)
                socket.to(message.key).emit('reeeeeeeeee');
            }
            
            else{
                console.log('no key')
            }
        })
    
        socket.on("load-status", (message) => {
            console.log('load status')
            console.log(message)
            socket.emit("load-status", message)
        })
    
        socket.on('join', function(room) {
            console.log('join')
            const rooms = socket.rooms
            
            // join room if not already
            if (!rooms.has(room)){
                console.log('joining room ' + room)
                socket.join(room);
            }
            
            io.to(room).emit('message', 'ahhhhhh')
        });
    });

    // // handle response from web
    // socket.on('control-response', (message) => {
    //     if (message.type === 'video-status'){
    //         // handle success
    //         console.log('video ' + message.status);
    //     }
    //     else {
    //         // handle error, send to remote 
    //     }
    // })
}
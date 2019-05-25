var app  = require('express'  )();
var http = require('http'     ).Server(app);
var io   = require('socket.io')(http);

io.on('connection', function(socket) {

    const hear  = require('./modules/asr-service' ).hear;
    const read  = require('./modules/asr-service' ).read;
    const reply = require('./modules/chat-service').reply;
    let   rec   = require('./modules/recorder'    ).recorder('rec');
   
    socket.on('record', function(toggle){
        if (toggle == 'on') {
            rec.start();
        }
        else {
            let pcm = rec.complete();
            
            hear(pcm, (res) => {
                let msg = res.result[0];
                
                io.to(socket.id).emit('yousay', msg);
        
                reply(msg, res => {
                    let reply = res.results[0].values.text;
                    io.to(socket.id).emit('botsay', reply);
                    read(reply);
                });
            });
        }
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000')
    console.log('For raspberry pi, do "export AUDIODEV=hw:1,0" first '
               +'to indicate audio devices.');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
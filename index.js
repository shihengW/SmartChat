let app   = require('express'               )();
let http  = require('http'                  ).Server(app);
let io    = require('socket.io'             )(http);

let hear  = require('./modules/asr-service' ).hear;
let read  = require('./modules/asr-service' ).read;
let reply = require('./modules/chat-service').reply;
let rec   = require('./modules/recorder'    ).recorder();

io.on('connection', function(socket) {

    socket.on('record', function() {
        // voice -> text -> reply -> voice -> play
        let process = pcm => {
            if (pcm) {
                io.emit('record complete');
                hear(pcm, (res) => {
                    const msg = res.result[0];
                    io.emit('yousay', msg);

                    reply(msg, res => {
                        let reply = res.results[0].values.text;
                        io.emit('botsay', reply);
                        read(reply);
                    });
                });
            }
            else {
                console.log('pcm processed already.');
            }
        }

        rec.start()
        .on('close', () => {
            process(rec.complete());
        });
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
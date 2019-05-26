let app   = require('express'               )();
let http  = require('http'                  ).Server(app);
let io    = require('socket.io'             )(http);
let hear  = require('./modules/asr-service' ).hear;
let read  = require('./modules/asr-service' ).read;
let reply = require('./modules/chat-service').reply;
let rec   = require('./modules/recorder'    ).record;
let Kws = require('./modules/kws-service').Kws;

const kws = new Kws();

kws
.on('keyword', (keyword) => {
    io.emit('high');
})
.on('command', (pcm) => {    
    
    io.emit('low');

    // voice -> text -> reply -> voice -> play
    hear(pcm, (res) => {
        const msg = res.result[0];
        io.emit('yousay', msg);

        reply(msg, res => {
            let reply = res.results[0].values.text;
            io.emit('botsay', reply);
            read(reply);
        });
    });
});

rec().pipe(kws);

io.on('connection', socket => {});

http.listen(3000, () => {
    console.log('listening on *:3000')
    console.log('For raspberry pi, do "export AUDIODEV=hw:1,0" first '
               +'to indicate audio devices.');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
let app   = require('express'               )();
let http  = require('http'                  ).Server(app);
let io    = require('socket.io'             )(http);
let hear  = require('./modules/asr-service' ).hear;
let read  = require('./modules/asr-service' ).read;
let reply = require('./modules/chat-service').reply;
let rec   = require('./modules/recorder'    ).record;
let Kws   = require('./modules/kws-service').Kws;

const kws = new Kws();

let parseRes = res => {
    let reply = '';

    for (var i = 0; i < res.results.length; ++i)
    {
        let result = res.results[i];

        switch (result.resultType) {
            case 'text':
                reply += (reply == '' ? '' : '。') + result.values.text;
                break;
            case 'news': { // yes i am a c programmer, so what...
                let news = result.values.news;
                let size = news.length < 3 ? news.length : 3;

                for (var j = 0; j < size; ++j) {
                    reply = reply + (reply == '' ? '' : '。') + news[j].name;
                }

                break;
            }
            default: break;
        }
    }

    return reply;
}

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
            let reply = parseRes(res);
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
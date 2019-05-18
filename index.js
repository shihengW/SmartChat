var express = require('express');
var app = express();
var fs = require('fs');
var https = require('https').createServer(
        {
          key: fs.readFileSync('server.key'),
          cert: fs.readFileSync('server.cert')
        },
        app);
var io = require('socket.io')(https);
const request = require('request-promise');

// Audio generation.
var AipSpeechClient = require("baidu-aip-sdk").speech;
var client = new AipSpeechClient(
    "16281588"/* APP_ID */,
    "faU32SvL07labqGksB35TAGn" /* APP_KEY */,
    "sFQvGf7rncYMNuBqGmSlXPzioagVOX4Y" /* SECURET_KEY */);
var mp3decoder = require('lame').Decoder;
var speaker = require('speaker');

app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function robochat (text) {
  const textTpl = {
    'perception': {
      'inputText': { 'text': text },
      'selfInfo': { 'from': 'chat' }
    },
    'userInfo': {
      'apiKey': '38c62badf9af4e069aacdd647e0fde7d',
      'userId': 'swei'
    }
  }

  let options = {
    method: 'POST',
    uri: 'http://openapi.tuling123.com/openapi/api/v2',
    body: textTpl,
    json: true
  }

  return request(options)
}

function genvoice(text) {
  client.text2audio(text, {spd: 4, per: 3}).then(function(result) {
    if (result.data) {
        fs.writeFileSync('temp.mp3', result.data);
        fs.createReadStream('temp.mp3')
            .pipe(new mp3decoder/* must be new */)
            .pipe(new speaker/* must be new */);

    } else {
        console.log(result)
    }
  }, function(e) {
    console.log(e)
  });
}

io.on('connection', function(socket) {
  socket.on('yousay', function(pcm){
    client.recognize(pcm, 'wav', 16000, { lan: 'zh' })
      .then(function(res) {
        if (res.err_no === 0) {
          let msg = res.result[0];
          io.to(socket.id).emit('yousay', msg);
          robochat(msg)
            .then((res) => {
              let reply = res.results[0].values.text;
              io.to(socket.id).emit('botsay', reply);
              genvoice(reply);
          })
          .catch((err) => {
            console.error(err)
          })
        }
      })
      .catch(function (err) {
        console.error(err)
      });
  });
});

https.listen(3000, function () {
  console.log('listening on port 3000! Go to https://localhost:3000/')
});
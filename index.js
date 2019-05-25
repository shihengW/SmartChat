var fs = require('fs');

const request = require('request-promise');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Audio generation.
var AipSpeechClient = require("baidu-aip-sdk").speech;
var client = new AipSpeechClient(
    "16281588"/* APP_ID */,
    "faU32SvL07labqGksB35TAGn" /* APP_KEY */,
    "sFQvGf7rncYMNuBqGmSlXPzioagVOX4Y" /* SECURET_KEY */);
var mp3decoder = require('lame').Decoder;
var speaker = require('speaker');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



// Import module.
const AudioRecorder = require('node-audiorecorder');
 
// Options is an optional parameter for the constructor call.
// If an option is not given the default value, as seen below, will be used.
const options = {
  program: `rec`,     // Which program to use, either `arecord`, `rec`, or `sox`.
  device: null,       // Recording device to use.
  
  bits: 16,           // Sample size. (only for `rec` and `sox`)
  channels: 1,        // Channel count.
  encoding: `signed-integer`,  // Encoding type. (only for `rec` and `sox`)
  format: `S16_LE`,   // Encoding type. (only for `arecord`)
  rate: 16000,        // Sample rate.
  type: `wav`,        // Format type.
  
  // Following options only available when using `rec` or `sox`.
  silence: 3,         // Duration of silence in seconds before it stops recording.
  thresholdStart: 0,  // Silence threshold to start recording.
  thresholdStop: 0.5,   // Silence threshold to stop recording.
  keepSilence: true   // Keep the silence in the recording.
};
// Optional parameter intended for debugging.
// The object has to implement a log and warn function.
const logger = console;
 
// Create an instance.
let audioRecorder = new AudioRecorder(options, logger);

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

  let pcm_buffer = undefined;

  socket.on('record', function(toggle){

    console.log(toggle);
    
    if (toggle == 'on') {
      pcm_buffer = Buffer.alloc(0);
      audioRecorder.start().stream().on('data', function(buff) {
        pcm_buffer = Buffer.concat([pcm_buffer, buff]);
      });
    }
    else
    {
      audioRecorder.stop();

      client.recognize(pcm_buffer, 'wav', 16000, { lan: 'zh' })
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

    }

  })

  socket.on('yousay', function(){
    
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

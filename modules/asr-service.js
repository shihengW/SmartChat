let fs = require('fs');
let AipSpeechClient = require("baidu-aip-sdk").speech;
let mp3decoder = require('lame').Decoder;
let speaker = require('speaker');

const client = new AipSpeechClient(
    "16281588",                          // APP_ID
    "faU32SvL07labqGksB35TAGn",          // APP_KEY
    "sFQvGf7rncYMNuBqGmSlXPzioagVOX4Y"); // SECURET_KEY

const voice = {
    spd: 4,
    per: 3
};

exports.read = function(text) {
    client.text2audio(text, voice)
    .then(function(result) {
        if (result.data) {
            // TODO:
            fs.writeFileSync('temp.mp3', result.data);
            
            fs.createReadStream('temp.mp3')
            .pipe(new mp3decoder/* must be new */)
            .pipe(new speaker/* must be new */);

        }
        else {
            console.log(result)
        }
    },
    function(e) {
        console.log(e)
    });
}

exports.hear = function(pcm, cb) {
    client.recognize(pcm, 'wav', 16000, { lan: 'zh' })
    .then(function(res) {
        if (res.err_no === 0) {
            cb(res);
        }
        else {
            console.log(
                'err after hear with code: ' + res.err_no);
        }
    })
    .catch(err =>
        console.error(
            'major err after hear: ' + err));
}
const request = require('request-promise');

module.exports.reply = function(msg, cb) {

    const text = {
        'perception': {
            'inputText': {
                'text': msg
            },
            'selfInfo': {
                'from': 'chat'
            }
        },
        'userInfo': {
            'apiKey': 'fa99668bdb274dfbaca1503dc2857af6',
            'userId': 'swei'
        }
    };
    
    const options = {
        method: 'POST',
        uri: 'http://openapi.tuling123.com/openapi/api/v2',
        body: text,
        json: true
    }
    
    request(options)
    .then(res => {
        if (cb) {
            cb(res);
        }
    })
    .catch(err => console.error('major err when reply ' + err));
}
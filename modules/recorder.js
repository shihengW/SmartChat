const AudioRecorder = require('node-audiorecorder');

class Recorder extends require(`events`).EventEmitter {

    constructor() {
        super();
        
        const options = {
            program:        `rec`,             // Which program to use, either `arecord`, `rec`, or `sox`.
            device:         null,              // device, for 'arecord' on raspberry pi, set with `plughw:1,0`.

            bits:           16,                // Sample size. (only for `rec` and `sox`)
            channels:       1,                 // Channel count.
            encoding:       `signed-integer`,  // Encoding type. (only for `rec` and `sox`)
            format:         `S16_LE`,          // Encoding type. (only for `arecord`)
            rate:           16000,             // Sample rate.
            type:           `wav`,             // Format type.
            
            // Following options only available when using `rec` or `sox`.
            silence:        1,                 // Duration of silence in seconds before it stops recording.
            thresholdStart: 0,                 // Silence threshold to start recording.
            thresholdStop:  0.5,               // Silence threshold to stop recording.
            keepSilence:    false              // Keep the silence in the recording.
        };

        this.audioRecorder = new AudioRecorder(options, console);
        this.pcm_buffer    = undefined;
        this.recording     = false;
    }

    start() {
        let self        = this;
        this.recording  = true;
        this.pcm_buffer = Buffer.alloc(0);
        this.audioRecorder.start().stream()
        .on('data', buff => {
            this.pcm_buffer = Buffer.concat([this.pcm_buffer, buff]);
        })
        .on('close', function (code) {
            // Just pass it out;
            self.emit('close', code);
        });

        return this;
    }

    complete() {
        this.audioRecorder.stop();

        if (!this.recording) {
            return null;
        }
        
        this.recording = false;
        return this.pcm_buffer;
    }
}

exports.recorder = caller => new Recorder(caller);
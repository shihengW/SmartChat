const AudioRecorder = require('node-audiorecorder');

class Recorder{

    constructor(caller) {
        const options = {
            program: caller,             // Which program to use, either `arecord`, `rec`, or `sox`.
            device: null,                // or `plughw:1,0`, on raspberry pi

            bits: 16,                    // Sample size. (only for `rec` and `sox`)
            channels: 1,                 // Channel count.
            encoding: `signed-integer`,  // Encoding type. (only for `rec` and `sox`)
            format: `S16_LE`,            // Encoding type. (only for `arecord`)
            rate: 16000,                 // Sample rate.
            type: `wav`,                 // Format type.
            
            // Following options only available when using `rec` or `sox`.
            silence: 3,           // Duration of silence in seconds before it stops recording.
            thresholdStart: 0,    // Silence threshold to start recording.
            thresholdStop: 0.5,   // Silence threshold to stop recording.
            keepSilence: true     // Keep the silence in the recording.
        };

        this.audioRecorder = new AudioRecorder(options, console);

        this.pcm_buffer = undefined;
    }

    start(cb) {
        this.pcm_buffer = Buffer.alloc(0);

        this.audioRecorder.start().stream().on('data', (buff) => {
            console.log('.');
            
            this.pcm_buffer = Buffer.concat([this.pcm_buffer, buff]);

            if (cb) {
                cb(buff);
            }
        });
    }

    complete() {
        console.log(this.pcm_buffer);
        
        this.audioRecorder.stop();

        return this.pcm_buffer;
    }
}

exports.recorder = caller => new Recorder(caller);
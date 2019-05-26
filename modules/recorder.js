const AudioRecorder = require('node-audiorecorder');

exports.record = function() {

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
        thresholdStop:  0,               // Silence threshold to stop recording.
        keepSilence:    false              // Keep the silence in the recording.
    };

    let rec = new AudioRecorder(options, console);
    
    rec.start();

    return rec.stream();
}
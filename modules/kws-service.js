const Detector = require('snowboy').Detector;
const Models   = require('snowboy').Models;

const SILENCE_FRAMES = 5;

// Just a wrapper to hide the configurations.
class Kws extends Detector {

    onSilence() {
        console.log('sil');

        if (this.recording) {
            --this.silCountDown;

            if (this.silCountDown == 0) {
                console.log("stop recording and send cmd.");
                
                this.recording = false;

                this.emit('command', this.pcm_buffer);
            }
        }
    }

    onSound(buffer) {

        console.log('sound');

        if (this.recording) {

            this.pcm_buffer = Buffer.concat([this.pcm_buffer, buffer]);
            
            ++this.silCountDown;
    
            this.silCountDown = this.silCountDown > SILENCE_FRAMES
                ? SILENCE_FRAMES
                : this.silCountDown;
        }
    }

    onKws(keyword) {

        console.log("keyword detected, start recording.");
        
        this.recording  = true;
        
        this.silCountDown = SILENCE_FRAMES;
        
        this.pcm_buffer = Buffer.alloc(0);

        this.emit('keyword', keyword);
    }

    constructor() {
        const models = new Models();

        models.add({
          file:        './resources/黑猫警长.pmdl',
          sensitivity: '0.5',
          hotwords :   '黑猫警长'
        });
        
        const settings = {
          resource:      "./resources/common.res",
          models:        models,
          audioGain:     2.0,
          applyFrontend: true
        };

        super(settings);

        this.silCountDown   = SILENCE_FRAMES;
        this.pcm_buffer = undefined;
        this.recording  = false;

        let self = this;

        this.on('silence', (             ) => self.onSilence(       ))
            .on('sound'  , (buffer       ) => self.onSound  (buffer ))
            .on('hotword', (i, hotword, b) => self.onKws    (hotword));
    }
}

module.exports.Kws = Kws;
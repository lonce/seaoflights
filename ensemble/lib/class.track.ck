//-----------------------------------------------------------------------------
// name: track.ck
// desc: a collection of synth tied to a metronome
//
// authors: Trijeet Mukhopadhyay (trijeetm@ccrma.stanford.edu)
// date: spring 2017
//       Stanford University
//-----------------------------------------------------------------------------

public class Track {
    int id;
    OscSend xmit;
    float originalBpm;

    Metronome metro;
    dur baseNoteLen;

    Sequencer sequence;
    false => int seqLoaded;

    false => int isPlaying;
    true => int isMute;
    false => int isPhasing;

    0 => int offset;

    /* SEQUENCES */
    Sequencer tappingSeq[3];

    int _measure[][];

    // TS 1
    [[36, 1], [48, 1], [48, 1], [48, 1], [36, 1], [48, 1], [48, 1], [48, 1]] @=> _measure;
    tappingSeq[0].addMeasure(_measure);


    // TS 2
    [[40, 1], [52, 1], [52, 1], [52, 1], [40, 1], [52, 1], [52, 1], [52, 1]] @=> _measure;
    tappingSeq[1].addMeasure(_measure);

    // TS 3
    [[33, 1], [45, 1], [45, 1], [45, 1], [33, 1], [45, 1], [45, 1], [45, 1]] @=> _measure;
    tappingSeq[2].addMeasure(_measure);

    fun void init(int _id, OscSend _xmit, float bpm) {
        _id => id;
        _xmit @=> xmit;
        bpm => originalBpm;

        metro.setup(bpm, 8, 8);

        metro.getSixteenthBeatDur() => baseNoteLen;

        initPlayer(metro.getSixteenthBeatDur());
    }

    fun void reinit() {
        initPlayer(metro.getSixteenthBeatDur());
    }

    fun void loadSequence(int seqID) {
        if (seqID == 0)
            spork ~ _loadSequence(tappingSeq[0]);
        if (seqID == 1)
            spork ~ _loadSequence(tappingSeq[1]);
        if (seqID == 2)
            spork ~ _loadSequence(tappingSeq[2]);
    }

    fun void _loadSequence(Sequencer seq) {
        metro.measureTick => now;

        false => seqLoaded;
        seq @=> sequence;
        <<< "Loaded sequence, measures: ", seq.measures >>>;
        true => seqLoaded;
    }

    fun void play() {
        metro.start();
        true => isPlaying;
        spork ~ loop();
        spork ~ watch();
    }

    fun void pause() {
        false => isPlaying;
    }

    fun void stop() {
        metro.stop();
        false => isPlaying;
    }

    fun void loop() {
        while (isPlaying) {
            metro.eighthNoteTick => now;


            if (seqLoaded && !isMute) {
                if (sequence.hasNote()) {
                    triggerPlayer(sequence.getNote(), sequence.getLength());
                }

                sequence.tick();
            }
        }
    }

    // use only for reading, never writing
    fun void watch() {
        while (isPlaying) {
            metro.measureTick => now;
            1::samp => now;
            <<< metro.getMeasure() >>>;
            <<< "[", !isMute, "]", " track:", id, "offset:", sequence.getOffset(), "(", isPhasing, ")" >>>;
        }
    }

    fun void incOffset() {
        spork ~ _incOffset();
    }

    fun void _incOffset() {
        metro.measureTick => now;

        sequence.incOffset();
    }

    fun void decOffset() {
        spork ~ _decOffset();
    }

    fun void _decOffset() {
        metro.measureTick => now;

        sequence.decOffset();
    }

    fun void mute() {
        spork ~ _mute();
    }

    fun void _mute() {
        metro.measureTick => now;
        true => isMute;
    }

    fun void unmute() {
        spork ~ _unmute();
    }

    fun void _unmute() {
        metro.measureTick => now;
        false => isMute;
    }

    fun void phase(int phaseLvl) {
        if (!isPhasing) {
            metro.measureTick => now;
            spork ~ _phase(phaseLvl);
        }
    }

    fun void _phase(int phaseLvl) {
        <<< "starting phase:", phaseLvl >>>;
        true => isPhasing;
        // slow
        if (phaseLvl == 4) {
            originalBpm * 1.04 => float newBpm;
            <<< newBpm, 26 >>>;
            metro.updateBpm(newBpm);
            metro.waitForMeasures(26);
            metro.updateBpm(originalBpm);
        }
        // slow
        if (phaseLvl == 5) {
            originalBpm * 1.05 => float newBpm;
            <<< newBpm, 21 >>>;
            metro.updateBpm(newBpm);
            metro.waitForMeasures(21);
            metro.updateBpm(originalBpm);
        }
        // med
        if (phaseLvl == 10) {
            originalBpm * 1.1 => float newBpm;
            <<< newBpm >>>;
            metro.updateBpm(newBpm);
            metro.waitForMeasures(11);
            metro.updateBpm(originalBpm);
        }
        // fast
        if (phaseLvl == 25) {
            originalBpm * 1.25 => float newBpm;
            <<< newBpm >>>;
            metro.updateBpm(newBpm);
            metro.waitForMeasures(5);
            metro.updateBpm(originalBpm);
        }
        // v fast
        if (phaseLvl == 50) {
            originalBpm * 1.5 => float newBpm;
            <<< newBpm >>>;
            metro.updateBpm(newBpm);
            metro.waitForMeasures(3);
            metro.updateBpm(originalBpm);
        }
        false => isPhasing;
    }

    fun void initPlayer(dur baseNoteLen) {
        baseNoteLen / 1::samp => float lenInFloat;
        "/player/init" => string path;
        xmit.startMsg(path, "i f");
        id => xmit.addInt;
        lenInFloat => xmit.addFloat;
        <<< "init-ing player" >>>;
    }

    fun void triggerPlayer(int note, int len) {
        xmit.startMsg("/player/trigger", "i i");
        note => xmit.addInt;
        len => xmit.addInt;
        <<< "." >>>;
    }

    fun void setSynthGain(int osc, int gain) {
        "/player/synth/gain" => string path;
        xmit.startMsg(path, "i i i");
        id => xmit.addInt;
        osc => xmit.addInt;
        gain => xmit.addInt;
    }

    fun void setSynthAttack(int atk) {
        "/player/synth/attack" => string path;
        xmit.startMsg(path, "i i");
        id => xmit.addInt;
        atk => xmit.addInt;
    }

    fun void setSynthRelease(int rel) {
        "/player/synth/release" => string path;
        xmit.startMsg(path, "i i");
        id => xmit.addInt;
        rel => xmit.addInt;
    }
}
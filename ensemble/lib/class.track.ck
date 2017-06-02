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
    false => int isGlitching;

    true => int isAwake;
    false => int isWaving;

    0 => int offset;

    /* SEQUENCES */
    int _measure[][];

    /* MOVEMENT 1 */
    Sequencer tappingSeq[3];
    for (0 => int i; i < tappingSeq.cap(); i++)
        tappingSeq[i].init(8);

    // TS 1
    [[48, 1], [0, 0], [48, 1], [0, 0], [48, 1], [0, 0], [48, 1], [0, 0]] @=> _measure;
    tappingSeq[0].addMeasure(_measure);


    // TS 2
    [[40, 1], [40, 1], [40, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] @=> _measure;
    tappingSeq[1].addMeasure(_measure);

    // TS 3
    [[55, 1], [0, 0], [0, 0], [0, 0], [55, 1], [55, 1], [0, 0], [0, 0]] @=> _measure;
    tappingSeq[2].addMeasure(_measure);

    /* MOVEMENT 2 */
    Sequencer wavesSeq[4];
    for (0 => int i; i < wavesSeq.cap(); i++)
        wavesSeq[i].init(6);

    // W 1
    [[48, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] @=> _measure;
    wavesSeq[0].addMeasure(_measure);

    // W 2
    [[55, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] @=> _measure;
    wavesSeq[1].addMeasure(_measure);

    // W 3
    [[53, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] @=> _measure;
    wavesSeq[2].addMeasure(_measure);

    // W 4
    [[57, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] @=> _measure;
    wavesSeq[3].addMeasure(_measure);


    /* MOVEMENT 3 */
    Sequencer chordSeq[6];
    for (0 => int i; i < chordSeq.cap(); i++)
        chordSeq[i].init(12);

    // C1
    [[36, 16], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]] @=> _measure;
    chordSeq[0].addMeasure(_measure);

    // C2
    [[35, 16], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]] @=> _measure;
    chordSeq[1].addMeasure(_measure);

    // C3
    [[31, 16], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]] @=> _measure;
    chordSeq[2].addMeasure(_measure);

    // C4
    [[28, 16], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]] @=> _measure;
    chordSeq[3].addMeasure(_measure);

    // C5
    [[26, 16], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]] @=> _measure;
    chordSeq[4].addMeasure(_measure);

    // C6
    [[24, 16], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]] @=> _measure;
    chordSeq[5].addMeasure(_measure);

    Sequencer phasingSeq[1];
    for (0 => int i; i < phasingSeq.cap(); i++)
        phasingSeq[i].init(12);

    // full clapping rhythm
    [[48, 1], [50, 1], [52, 1], [0, 1], [55, 1], [59, 1], [0, 1], [60, 1], [0, 1], [59, 1], [55, 1], [0, 1]] @=> _measure;
    phasingSeq[0].addMeasure(_measure);

    /* MOVEMENT 4 */
    Sequencer bassSeq[1];
    for (0 => int i; i < bassSeq.cap(); i++)
        bassSeq[i].init(16);

    // B1
    [[36, 2], [0, 1], [0, 1], [0, 1], [34, 2], [0, 1], [0, 1], [0, 1], [32, 1], [0, 1], [39, 1], [0, 1], [38, 2], [0, 1], [0, 1], [0, 1]] @=> _measure;
    bassSeq[0].addMeasure(_measure);


    fun void init(int _id, OscSend _xmit, float bpm, int beatNumber, int beatMeasure, int _offset) {
        _id => id;
        _xmit @=> xmit;
        bpm => originalBpm;
        _offset => offset;

        unloadSequence();

        if (isPlaying)
            stop();
        metro.setup(bpm, beatNumber, beatMeasure);

        metro.getSixteenthBeatDur() => baseNoteLen;

        initPlayer(metro.getSixteenthBeatDur());
    }

    fun void reinit() {
        initPlayer(metro.getSixteenthBeatDur());
    }

    fun void unloadSequence() {
        false => seqLoaded;
    }

    fun void loadSequence(int seqType, int seqID) {
        <<< "loading new sequence..." >>>;

        // Movement 1: tapping
        if (seqType == 1) {
            spork ~ _loadSequence(tappingSeq[seqID]);
        }

        // Movement 2: waves
        if (seqType == 2) {
            spork ~ _loadSequence(wavesSeq[seqID]);
        }

        // Movement 3.1: chords
        if (seqType == 3) {
            spork ~ _loadSequence(chordSeq[seqID]);
        }

        // Movement 3.2: phases
        if (seqType == 4) {
            spork ~ _loadSequence(phasingSeq[seqID]);
        }
        // Movement 4: rebirth
        if (seqType == 5) {
            spork ~ _loadSequence(bassSeq[seqID]);
        }
    }

    fun void _loadSequence(Sequencer seq) {
        metro.measureTick => now;

        false => seqLoaded;
        seq @=> sequence;
        <<< "loaded sequence, measures: ", seq.measures >>>;
        sequence.setOffset(offset);
        true => seqLoaded;
    }

    fun void runWave(int seqType, int seqID) {
        if (isWaving) {
            <<< "Wave in progression, wait..." >>>;
            return;
        }
        if (seqType == 2) {
            spork ~ _runWave(wavesSeq[seqID]);
        }
    }

    fun void _runWave(Sequencer seq) {
        // Movement 2: waves
        true => isWaving;
        metro.start();
        seq.setOffset(offset);

        seq.SEQ_LEN => int notesLeft;

        <<< "starting run..." >>>;
        while (true) {
            metro.eighthNoteTick => now;

            if (seq.hasNote()) {
                triggerPlayer(seq.getNote(), seq.getLength());
            }

            seq.tick() => int playhead;
            notesLeft--;

            <<< id, notesLeft >>>;

            if (notesLeft == 0) {
                break;
            }
        }
        <<< "end run!" >>>;
        metro.stop();
        false => isWaving;
    }

    fun void play() {
        metro.start();
        true => isPlaying;
        spork ~ loop();
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
                    if (isAwake)
                        triggerPlayer(sequence.getNote(), sequence.getLength());
                }

                sequence.tick() => int playhead;
            }
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

    fun void setOffset(int off) {
        <<< "setting offset" >>>;
        sequence.setOffset(off);
        <<< sequence.getOffset() >>>;
    }

    fun void mute() {
        <<< "deactivating track ", id >>>;
        spork ~ _mute();
    }

    fun void _mute() {
        metro.measureTick => now;
        true => isMute;
    }

    fun void unmute() {
        <<< "activating track ", id >>>;
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
        <<< "end phase" >>>;
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
    }

    fun void setSynthGain(int osc, int gain) {
        "/player/synth/gain" => string path;
        xmit.startMsg(path, "i i");
        osc => xmit.addInt;
        gain => xmit.addInt;
    }

    fun void setSynthAttack(int atk) {
        "/player/synth/attack" => string path;
        xmit.startMsg(path, "i");
        atk => xmit.addInt;
    }

    fun void setSynthRelease(int rel) {
        "/player/synth/release" => string path;
        xmit.startMsg(path, "i");
        rel => xmit.addInt;
    }

    fun void setSynthGlitch(int level) {
        xmit.startMsg("/player/synth/glitch", "i");
        level => xmit.addInt;
    }
}
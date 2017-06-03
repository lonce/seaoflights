//-----------------------------------------------------------------------------
// name: synth.ck
// desc: a synth composed of simple signals
//
// authors: Trijeet Mukhopadhyay (trijeetm@ccrma.stanford.edu)
// date: spring 2017
//       Stanford University
//-----------------------------------------------------------------------------

public class Synth {
    ADSR env => dac;

    SinOsc sin => env;
    SqrOsc sqr => env;
    SawOsc saw => env;
    Noise noise => BiQuad filter => env;
    TriOsc tri => env;

    dur baseNoteDur;
    0::ms => dur noteDur;

    OscSend gfxXmit;
    float rlsTime, atkTime;

    0 => float glitch;

    /* DRONE */
    ADSR dEnv => NRev dRev => dac;
    TriOsc d1 => dEnv;
    TriOsc d2 => dEnv;
    /*SawOsc dBass;*/
    SawOsc dBass => dEnv;
    Noise dNoise => BiQuad dFilter => dEnv;
    SinOsc dMod => blackhole;

    36 => float dRoot;
    0 => int currDroneIndex;
    [ [0, 2,  3,  5,  8, -2, 0, -2, -7, -4, -2, 0], [7, 7, 10, 12, 3, 5, 7,  5,  0,  3,  5, 7] ] @=> int droneNotes[][];
    float dNote1;
    float dNote2;

    fun void init(dur _baseNoteDur) {
        _baseNoteDur => baseNoteDur;

        setNote(48);
        setDur(baseNoteDur);

        // set biquad pole radius
        .99 => filter.prad;
        // set biquad gain
        .05 => filter.gain;
        // set equal zeros
        1 => filter.eqzs;

        0 => sin.gain;
        0 => sqr.gain;
        0 => saw.gain;
        0 => noise.gain;
        0 => tri.gain;

        env.set(0.001, 0, 1, 0.001);

        0.3 => d1.gain;
        0.3 => d2.gain;
        0.25 => dBass.gain;
        0.3 => dNoise.gain;
        0.5 => dRev.mix;
        // noise filter
        .99 => dFilter.prad;
        .05 => dFilter.gain;
        1 => dFilter.eqzs;
        dEnv.attackTime(4::second);
        dEnv.sustainLevel(1);
        dEnv.releaseTime(12::second);
        10 => dMod.freq;
        tuneDrone(dNote1, dNote2);

        gfxXmit.setHost("localhost", 12000);
        0.5 => rlsTime => atkTime;
    }

    fun void setNote(int note) {
        Std.mtof(note) => float freq;
        if (glitch)
            ((Math.random2f(0, glitch) * 2) * freq) => freq;

        freq => sin.freq;
        freq => sqr.freq;
        freq => saw.freq;
        freq => tri.freq;
        freq * 2 => filter.pfreq;
    }

    fun void setDur(dur _dur) {
        if (glitch)
            ((Math.random2f(0, glitch) * 2) * _dur) => noteDur;
        else
            _dur => noteDur;
    }

    fun void setDur(int _len) {
        setDur(_len * baseNoteDur);
    }

    fun void setOscGain(int osc, int gain) {
        float _gain;
        Math.pow(gain / 127.0, 2) => _gain;
        if (osc == 0)
            _gain => sin.gain;
        if (osc == 1)
            _gain => sqr.gain;
        if (osc == 2)
            _gain => saw.gain;
        if (osc == 3)
            _gain => noise.gain;
        if (osc == 4)
            _gain => tri.gain;
    }

    fun void setAttack(int atk) {
        env.attackTime((atk / 127.0) * noteDur);
    }

    fun void setRelease(int rel) {
        env.releaseTime((rel / 127.0) * noteDur * 32);
    }

    fun void setGlitch(int level) {
        level / 127.0 => glitch;
        if (glitch > 0) {
            env.attackTime(0::ms);
            env.releaseTime(0::ms);
        }
    }

    fun void play(int _note, int _len) {
        setNote(_note);
        setDur(_len);

        spork ~ _play();
    }

    fun void _play() {
        gfxFadeIn();
        <<< "." >>>;
        env.keyOn();
        noteDur => now;
        gfxFadeOut();
        env.keyOff();
    }

    fun void tuneDrone(float n1, float n2) {
        n1 => dNote1;
        n2 => dNote2;

        <<< dRoot, dNote1, dNote2 >>>;

        Std.mtof(dRoot + dNote1 + 12) => d1.freq;
        Std.mtof(dRoot + dNote1) => dBass.freq;
        Std.mtof(dRoot + dNote2) => d2.freq;
    }

    fun void modDrone() {
        while (true) {
            (Std.mtof(dRoot + dNote1) * 2) + (dMod.last() * 220) => dFilter.pfreq;
            <<< (Std.mtof(dRoot + dNote1) * 2) + (dMod.last() * 220) >>>;
            2048::samp => now;
        }
    }

    fun void advanceDrone() {
        (currDroneIndex + 1) % droneNotes[0].cap() => currDroneIndex;
        <<< "next drone chord" >>>;
        tuneDrone(droneNotes[0][currDroneIndex] $ float, droneNotes[1][currDroneIndex] $ float);
    }

    fun void startDrone() {
        <<< "start drone" >>>;
        spork ~ modDrone();
        gfxFadeIn();
        dEnv.keyOn();
    }

    fun void stopDrone() {
        <<< "end drone" >>>;
        gfxFadeOut();
        dEnv.keyOff();
    }

    fun void gfxFadeIn() {
        "/screen/fadeIn" => string path;
        gfxXmit.startMsg(path, "f");
        20.0 => gfxXmit.addFloat;
    }

    fun void gfxFadeOut() {
        "/screen/fadeOut" => string path;
        gfxXmit.startMsg(path, "f");
        30.0 => gfxXmit.addFloat;
    }
}
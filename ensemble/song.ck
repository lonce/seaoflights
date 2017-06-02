//--------------------------------------------------------------------
// name: song-of-longings.ck
// desc: Twilight: A Song of Longings instruments
//
// author: Ge Wang (ge@ccrma.stanford.edu)
// date: Spring 2013
//--------------------------------------------------------------------

// number of channels
dac.channels() => int CHANNELS;
// overall gain
.75 => float THE_GAIN;
// interpolator update rate
1::ms => dur INTERP_RATE;
// pitch dead zone (right pull)
.15 => float Z_PITCH_DEAD_ZONE_LO;
.7 => float Z_PITCH_DEAD_ZONE_HI;

// for out
public class SongTrak
{
    // shared event
    static Event @ onButton;
}

// create event
new Event @=> SongTrak.onButton;


// delays
Delay delay[CHANNELS];
Gain atten[CHANNELS];
NRev reverb[CHANNELS];

// patch
SinOsc vibrato => SinOsc c => LPF f;
// modulator
SinOsc m => c;

900 => f.freq;

// channels
for( int i; i < CHANNELS; i++ )
{
    // feedback
    f => delay[i] => atten[i] => delay[i];
    // connect
    delay[i] => reverb[i] => dac.chan(i);
    // atten
    .25 => atten[i].gain;
    // delay different
    (i+1)*100::ms => delay[i].max => delay[i].delay;
    // gain
    THE_GAIN => reverb[i].gain;
    // reverb
    .01 => reverb[i].mix;
}

// lfo
SinOsc lfo => blackhole;
LPF lpf => HPF hpf; // => blackhole;

// set LFO
.1 => lfo.freq;
// set to FM
2 => c.sync;
// silence
0 => c.gain;

// vibrato rate
6 => vibrato.freq;
// resonant
1 => lpf.Q => hpf.Q;
// cutoff
500 => lpf.freq;
1000 => hpf.freq;

// mod freq
100 => m.freq;
0 => m.gain;

// freq slew
Vector3D iFreq;
// carrier gain
Vector3D iCarrierGain;
// set
iFreq.set( 220, 220, 5 );
iCarrierGain.set( 0, 0, 5 );

// make HidIn and HidMsg
Hid hi;
HidMsg msg;

// which joystick
0 => int device;
// get from command line
if( me.args() ) me.arg(0) => Std.atoi => device;

// open joystick 0, exit on fail
if( !hi.openJoystick( device ) ) me.exit();

<<< "joystick '" + hi.name() + "' ready", "" >>>;

// data structure for gametrak
class GameTrak
{
    // previous axis data
    float lastAxis[6];
    // current axis data
    float axis[6];
}

// game track data
GameTrak gt;

// spork interp
spork ~ iFreq.interp( INTERP_RATE );
// spork interp
spork ~ iCarrierGain.interp( INTERP_RATE );
// spork apply
spork ~ apply( INTERP_RATE );

// applying the value
fun void apply( dur T )
{
    while( true )
    {
        // apply
        iFreq.value() => c.freq;
        // mod
        c.freq() * .5 => m.freq;
        // mod index
        //c.freq() * .9 => m.gain;
        // gain
        iCarrierGain.value() => c.gain;
        // advance time
        T => now;
    }
}

// spork it
// spork ~ print();

// print
fun void print()
{
    // time loop
    while( true )
    {
        // values
        <<< "axes:", gt.axis[0],gt.axis[1],gt.axis[2],
                     gt.axis[3],gt.axis[4],gt.axis[5] >>>;
        // advance time
        100::ms => now;
    }
}

// scale
[ -2, 0, 2, 3, 5, 8 ] @=> int scale[];
// register
[ -2, -1, 0, 1, 2 ] @=> int register[];

// map Z axis to an index
fun int mapAxis2Index( float input, float lo, float hi, int numValues )
{
    // sanity check
    if( numValues <= 0 )
    {
        // error
        <<< "WARNING: non-positive numValues in mapAxis2Index()" >>>;
        // done
        return 0;
    }

    // sanity check
    if( lo >= hi )
    {
        // error
        <<< "WARNING: unreasonable lo/hi range in mapAxis2Index()" >>>;
        // done
        return 0;
    }

    // clamp
    if( input < lo ) lo => input;
    else if( input > hi ) hi => input;

    // percentage
    (input - lo) / (hi - lo) => float percent;
    // figure out which
    (percent * numValues) $ int => int index;
    // boundary case
    if( index >= numValues ) numValues-1 => index;

    // done
    return index;
}

// map Z axis to an value in range
fun float mapAxis2Range( float input, float lo, float hi, float outLo, float outHi )
{
    // sanity check
    if( outLo >= outHi )
    {
        // error
        <<< "WARNING: unreasonable output lo/hi range in mapAxis2Range()" >>>;
        // done
        return outLo;
    }

    // sanity check
    if( lo >= hi )
    {
        // error
        <<< "WARNING: unreasonable input lo/hi range in mapAxis2Range()" >>>;
        // done
        return outLo;
    }

    // clamp
    if( input < lo ) lo => input;
    else if( input > hi ) hi => input;

    // percentage
    (input - lo) / (hi - lo) => float percent;

    // done
    return outLo + ( percent * (outHi - outLo) );
}

// map
fun void map()
{
    // map initial pull to volume
    mapAxis2Range( gt.axis[5], Z_PITCH_DEAD_ZONE_LO*.05, Z_PITCH_DEAD_ZONE_LO*.5, 0, 1 ) => float pullGain;
    // map to pitch index
    mapAxis2Index( gt.axis[5], Z_PITCH_DEAD_ZONE_LO, Z_PITCH_DEAD_ZONE_HI, scale.size() ) => int index;
    // map to vibrato
    mapAxis2Range( gt.axis[4], -.75, 1, 0, 15 ) => float vibe;
    // map to gain
    Math.pow( mapAxis2Range( gt.axis[4], -.6, 0, 0, 1 ), 2.5 ) => float inGain;
    // map to cutoff
    mapAxis2Range( gt.axis[3], -1, -.1, -1, 0 ) => float detune1;
    // map to cutoff
    mapAxis2Range( gt.axis[3], .1, 1, 0, 1 ) => float detune2;
    // map to register
    mapAxis2Index( gt.axis[0], -1, 1, register.size() ) => int reg;

    // log
    //<<< "index:", index, "vibe:", vibe, "port:", port, "register:", reg >>>;

    // set the freq
    scale[index] + 72 + detune1 + detune2 /*+ register[reg]*12*/ => Std.mtof => iFreq.goal;
    // set vibrato rate
    Math.pow( vibe, 1.0 ) => vibrato.freq;
    // set vibrato gain
    vibe * 2 => vibrato.gain;
    // set gain
    Math.pow( pullGain * inGain, .3 ) => iCarrierGain.goal;
    // set cutoff
    //cutoff => hpf.freq;
    // set cutoff
    //cutoff*3=> lpf.freq;

    // q
    1 => float Q;
    if( gt.axis[4] > 0 ) gt.axis[4] +=> Q;
    //Q => lpf.Q => hpf.Q;
}

// infinite event loop
while( true )
{
    // wait on HidIn as event
    hi => now;

    // messages received
    while( hi.recv( msg ) )
    {
        // joystick axis motion
        if( msg.isAxisMotion() )
        {
            // check which
            if( msg.which >= 0 && msg.which < 6 )
            {
                // save last
                gt.axis[msg.which] => gt.lastAxis[msg.which];
                // the z axes map to [0,1], others map to [-1,1]
                if( msg.which != 2 && msg.which != 5 )
                { msg.axisPosition => gt.axis[msg.which]; }
                else
                { 1 - ((msg.axisPosition + 1) / 2) => gt.axis[msg.which]; }

                // map
                map();
            }
        }

        // joystick button down
        else if( msg.isButtonDown() )
        {
            // <<< "joystick button", msg.which, "down" >>>;
            /*SongTrak.onButton.broadcast();*/
        }

        // joystick button up
        else if( msg.isButtonUp() )
        {
            // <<< "joystick button", msg.which, "up" >>>;
        }
    }
}

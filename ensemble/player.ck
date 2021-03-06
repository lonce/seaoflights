Synth synth;
false => int ready;
0 => int id;

// create our OSC receiver
OscRecv recv;

main();

fun void main() {
    Std.atoi(me.arg(0)) => id;

    setupNetwork();

    spork ~ init();
    spork ~ handleConductor();

    spork ~ handleSynthGain();
    spork ~ handleSynthAttack();
    spork ~ handleSynthRelease();
    spork ~ handleSynthGlitch();

    spork ~ handleDroneStart();
    spork ~ handleDroneStop();
    spork ~ handleDroneAdvance();

    while (true) 1::second => now;
}

fun void setupNetwork() {
    // use port 6449
    6449 + id => recv.port;
    <<< "listening to port: ", 6449 + id >>>;
    // start listening (launch thread)
    recv.listen();

    OscSend send;
    "Trijeet.local" => string host;
    if (me.arg(1) != "") me.arg(1) => host;
    send.setHost(host, 6000);

    send.startMsg("/player/awake", "i");
    id => send.addInt;
    <<< "initializing..." >>>;
}

fun void init() {
    // create an address in the receiver, store in new variable
    recv.event("/player/init, i f") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        // wait for event to arrive
        oe => now;

        // grab the next message from the queue.
        while (oe.nextMsg() != 0) {
            oe.getInt() => int _id;
            oe.getFloat()::samp => dur baseNoteDur;

            if (_id == id) {
                synth.init(baseNoteDur);
                true => ready;
                <<< "player init, id: ", id >>>;
            }
        }
    }
}

fun void handleConductor() {
    // create an address in the receiver, store in new variable
    recv.event("/player/trigger, i i") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;


        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                oe.getInt() => int note;
                oe.getInt() => int len;
                synth.play(note, len);
            }
        }
    }
}

fun void handleSynthGain() {
    // create an address in the receiver, store in new variable
    recv.event("/player/synth/gain, i i") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;

        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                oe.getInt() => int osc;
                oe.getInt() => int gain;
                synth.setOscGain(osc, gain);
            }
        }
    }
}

fun void handleSynthAttack() {
    // create an address in the receiver, store in new variable
    recv.event("/player/synth/attack, i") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;

        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                oe.getInt() => int atk;
                synth.setAttack(atk);
            }
        }
    }
}

fun void handleSynthRelease() {
    // create an address in the receiver, store in new variable
    recv.event("/player/synth/release, i") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;

        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                oe.getInt() => int rel;
                synth.setRelease(rel);
            }
        }
    }
}

fun void handleSynthGlitch() {
    // create an address in the receiver, store in new variable
    recv.event("/player/synth/glitch, i") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;


        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                oe.getInt() => int level;
                synth.setGlitch(level);
            }
        }
    }
}

fun void handleDroneStart() {
    // create an address in the receiver, store in new variable
    recv.event("/player/drone/start") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;


        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                synth.startDrone();
            }
        }
    }
}

fun void handleDroneStop() {
    // create an address in the receiver, store in new variable
    recv.event("/player/drone/stop") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;


        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                synth.stopDrone();
            }
        }
    }
}

fun void handleDroneAdvance() {
    // create an address in the receiver, store in new variable
    recv.event("/player/drone/advance") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        oe => now;


        if (ready) {
            // wait for event to arrive

            // grab the next message from the queue.
            while (oe.nextMsg() != 0) {
                synth.advanceDrone();
            }
        }
    }
}
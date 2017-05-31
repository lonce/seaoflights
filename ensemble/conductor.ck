/* GLOBALS */
OscSend xmitters[12];
Track tracks[12];

0 => int movement;

/* SECTION INDICES */
// L
int leftSection[0];
leftSection << 0;
leftSection << 1;
leftSection << 10;
leftSection << 11;
// C
int centerSection[0];
centerSection << 2;
centerSection << 7;
centerSection << 8;
centerSection << 9;
// R
int rightSection[0];
rightSection << 3;
rightSection << 4;
rightSection << 5;
rightSection << 6;

// Drone
int droneSection[0];
droneSection << 5;
droneSection << 11;

int upperSection[0];
upperSection << 6;
upperSection << 7;
upperSection << 8;
upperSection << 9;
upperSection << 10;

int lowerSection[0];
lowerSection << 0;
lowerSection << 1;
lowerSection << 2;
lowerSection << 3;
lowerSection << 4;

main();

fun void main() {
    initNetwork();

    spork ~ handleMIDI();

    spork ~ watchPlayers();

    while (true) 1::second => now;
}

fun void initNetwork() {
    // host name and port
    string HOSTS[0];
    6449 => int port;

    // xmitters - inner ring L -> R, outer ring R -> L
    HOSTS << "localhost";       // L1: 0
    HOSTS << "localhost";       // L2: 1
    HOSTS << "localhost";       // C1: 2
    HOSTS << "localhost";       // R1: 3
    HOSTS << "localhost";       // R2: 4
    HOSTS << "localhost";       // R3: 5
    HOSTS << "localhost";       // R4: 6
    HOSTS << "localhost";       // C2: 7
    HOSTS << "localhost";       // C3: 8
    HOSTS << "localhost";       // C4: 9
    HOSTS << "localhost";       // L3: 10
    HOSTS << "localhost";       // L4: 11

    HOSTS.size() => int nHosts;

    // send object
    OscSend xmit[nHosts];

    // aim the transmitter
    for (0 => int i; i < nHosts; i++) {
        xmit[i].setHost(HOSTS[i], port + i);
    }

    xmit @=> xmitters;
}

fun void watchPlayers() {
    OscRecv recv;

    6000 => recv.port;
    // start listening (launch thread)
    recv.listen();

    // create an address in the receiver, store in new variable
    recv.event("/player/awake, i") @=> OscEvent oe;

    // infinite event loop
    while (true) {
        // wait for event to arrive
        oe => now;

        // grab the next message from the queue.
        while (oe.nextMsg() != 0) {
            oe.getInt() => int _id;
            tracks[_id].reinit();
        }
    }
}

fun void handleMIDI() {
    // number of the device to open (see: chuck --probe)
    1 => int device;
    // get command line
    if( me.args() ) me.arg(0) => Std.atoi => device;

    // the midi event
    MidiIn min;
    // the message for retrieving data
    MidiMsg msg;

    // open the device
    if( !min.open( device ) ) me.exit();

    // print out device that was opened
    <<< "MIDI device:", min.num(), " -> ", min.name() >>>;

    // infinite time-loop
    while(true) {
        // wait on the event 'min'
        min => now;

        // get the message(s)
        while(min.recv(msg)) {
            // <<< msg.data1, msg.data2, msg.data3 >>>;

            // MOVEMENT 1 init
            if ((msg.data1 == 176) && (msg.data2 >= 16) && (msg.data2 <= 23)) {
                if (movement != 1) {
                    1 => movement;

                    100 => float bpm;
                    8 => int beatNumber;
                    8 => int beatMeasure;

                    Track _tracks[12];

                    <<< "MOVEMENT 1: Tapping" >>>;
                    <<< "Initialing left section" >>>;
                    for (0 => int i; i < leftSection.cap(); i++) {
                        leftSection[i] => int id;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);
                    }
                    <<< "Initialing center section" >>>;
                    for (0 => int i; i < centerSection.cap(); i++) {
                        centerSection[i] => int id;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);
                    }
                    <<< "Initialing right section" >>>;
                    for (0 => int i; i < rightSection.cap(); i++) {
                        rightSection[i] => int id;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);
                    }

                    _tracks @=> tracks;
                }
            }

            // MOVEMENT 2 init
            if ((msg.data1 == 177) && (msg.data2 >= 16) && (msg.data2 <= 23)) {
                if (movement != 2) {
                    2 => movement;

                    25 => float bpm;
                    6 => int beatNumber;
                    8 => int beatMeasure;

                    Track _tracks[12];

                    <<< "MOVEMENT 2: Waves" >>>;
                    <<< "Initialing left section" >>>;
                    for (0 => int i; i < leftSection.cap(); i++) {
                        leftSection[i] => int id;
                        <<< id >>>;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);
                    }
                    <<< "Initialing center section" >>>;
                    for (0 => int i; i < centerSection.cap(); i++) {
                        centerSection[i] => int id;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, beatNumber - 1);
                    }
                    <<< "Initialing right section" >>>;
                    for (0 => int i; i < rightSection.cap(); i++) {
                        rightSection[i] => int id;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, beatNumber - 2);
                    }

                    _tracks @=> tracks;
                }
            }

            // MOVEMENT 3 init
            if ((msg.data1 == 178) && (msg.data2 >= 16) && (msg.data2 <= 23)) {
                if (movement != 3) {
                    3 => movement;

                    180 => float bpm;
                    12 => int beatNumber;
                    8 => int beatMeasure;

                    Track _tracks[12];

                    <<< "MOVEMENT 3: Phases" >>>;
                    <<< "Initialing drone section" >>>;
                    for (0 => int i; i < droneSection.cap(); i++) {
                        droneSection[i] => int id;
                        <<< id >>>;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);
                    }
                    <<< "Initialing upper section" >>>;
                    for (0 => int i; i < upperSection.cap(); i++) {
                        upperSection[i] => int id;
                        <<< id >>>;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);

                    }
                    <<< "Initialing lower section" >>>;
                    for (0 => int i; i < lowerSection.cap(); i++) {
                        lowerSection[i] => int id;
                        <<< id >>>;
                        _tracks[id].init(id, xmitters[id], bpm, beatNumber, beatMeasure, 0);
                    }

                    _tracks @=> tracks;
                }
            }

            // MOVEMENT 1 CC
            if (movement == 1) {
                if (msg.data2 == 53) {      // left section
                    if ((msg.data1 >= 144) && (msg.data1 <= 146)) {
                        for (int i; i < leftSection.cap(); i++) {
                            leftSection[i] => int _id;
                            tracks[_id].loadSequence(1, msg.data1 - 144);
                        }
                    }
                }
                if (msg.data2 == 54) {      // center section
                    if ((msg.data1 >= 144) && (msg.data1 <= 146)) {
                        for (int i; i < centerSection.cap(); i++) {
                            centerSection[i] => int _id;
                            tracks[_id].loadSequence(1, msg.data1 - 144);
                        }
                    }
                }
                if (msg.data2 == 55) {      // right section
                    if ((msg.data1 >= 144) && (msg.data1 <= 146)) {
                        for (int i; i < rightSection.cap(); i++) {
                            rightSection[i] => int _id;
                            tracks[_id].loadSequence(1, msg.data1 - 144);
                        }
                    }
                }

                // mute / unmute
                if ((msg.data2 == 91) && (msg.data1 == 144)) {
                    for (int i; i < tracks.cap(); i++)
                        tracks[i].unmute();
                }
                if ((msg.data2 == 92) && (msg.data1 == 144)) {
                    for (int i; i < tracks.cap(); i++)
                        tracks[i].mute();
                }

                if (msg.data1 == 176) {
                    // set release
                    if (msg.data2 == 19) {
                        for (int i; i < tracks.cap(); i++)
                            tracks[i].setSynthRelease(msg.data3);
                    }
                }
            }

            // MOVEMENT 2 CC
            if (movement == 2) {
                if (msg.data2 == 53) {
                    if ((msg.data1 >= 144) && (msg.data1 <= 145)) {
                        for (int i; i < tracks.cap(); i++) {
                            tracks[i].runSequence(2, msg.data1 - 144);
                        }
                    }
                }
            }

            // MOVEMENT 3 CC
            if (movement == 3) {
                if (msg.data2 == 57) {
                    if ((msg.data1 >= 144) && (msg.data1 <= 150)) {   // drone section
                        for (int i; i < droneSection.cap(); i++) {
                            droneSection[i] => int _id;
                            tracks[_id].loadSequence(3, msg.data1 - 144);
                            tracks[_id].unmute();
                        }
                    }
                }

                if (msg.data2 == 53) {
                    if ((msg.data1 >= 144) && (msg.data1 <= 144)) {
                        for (int i; i < upperSection.cap(); i++) {
                            upperSection[i] => int _id;
                            <<< i, _id >>>;
                            tracks[_id].loadSequence(4, msg.data1 - 144);
                            tracks[_id].unmute();
                        }
                    }
                }

                if (msg.data2 == 54) {
                    if ((msg.data1 >= 144) && (msg.data1 <= 144)) {
                        for (int i; i < lowerSection.cap(); i++) {
                            lowerSection[i] => int _id;
                            <<< i, _id >>>;
                            tracks[_id].loadSequence(4, msg.data1 - 144);
                            tracks[_id].unmute();
                        }
                    }
                }

                // set glitch level
                if (msg.data2 == 16)  {
                    for (int i; i < upperSection.cap(); i++) {
                        upperSection[i] => int _id;
                        tracks[_id].setSynthGlitch(msg.data3);
                    }
                    for (int i; i < lowerSection.cap(); i++) {
                        lowerSection[i] => int _id;
                        tracks[_id].setSynthGlitch(msg.data3);
                    }
                }

                // change offset
                if ((msg.data2 == 101) && (msg.data1 == 144)) {
                    for (int i; i < lowerSection.cap(); i++) {
                        lowerSection[i] => int _id;
                        tracks[_id].decOffset();
                    }
                }
                if ((msg.data2 == 100) && (msg.data1 == 144)) {
                    for (int i; i < lowerSection.cap(); i++) {
                        lowerSection[i] => int _id;
                        tracks[_id].incOffset();
                    }
                }

                // select phase
                if (msg.data2 == 52) {
                    if (msg.data1 == 144) {
                        for (int i; i < lowerSection.cap(); i++) {
                            lowerSection[i] => int _id;
                            tracks[_id].phase(4);
                        }
                    }
                    if (msg.data1 == 145) {
                        for (int i; i < lowerSection.cap(); i++) {
                            lowerSection[i] => int _id;
                            tracks[_id].phase(5);
                        }
                    }
                    if (msg.data1 == 146) {
                        for (int i; i < lowerSection.cap(); i++) {
                            lowerSection[i] => int _id;
                            tracks[_id].phase(10);
                        }
                    }
                    if (msg.data1 == 147) {
                        for (int i; i < lowerSection.cap(); i++) {
                            lowerSection[i] => int _id;
                            tracks[_id].phase(25);
                        }
                    }
                    if (msg.data1 == 148) {
                        for (int i; i < lowerSection.cap(); i++) {
                            lowerSection[i] => int _id;
                            tracks[_id].phase(50);
                        }
                    }
                }

                // mute
                if ((msg.data2 == 92) && (msg.data1 == 144)) {
                    for (int i; i < tracks.cap(); i++)
                        tracks[i].mute();
                }
            }

            /*if ((msg.data1 >= 176) && (msg.data1 <= 181)) {
                // select track
                if (msg.data2 == 16) {
                    msg.data1 - 176 => currTrack;
                    //<<< currTrack >>>;
                }
                // set osc gain
                if ((msg.data2 >= 20) && (msg.data2 <= 23)) {
                    tracks[currTrack].setSynthGain(msg.data2 - 20, msg.data3);
                }

                // set attack
                if (msg.data2 == 16) {
                    tracks[currTrack].setSynthAttack(msg.data3);
                }
                // set release
                if (msg.data2 == 19) {
                    tracks[currTrack].setSynthRelease(msg.data3);
                }
            }

            // change offset
            if ((msg.data2 == 101) && (msg.data1 == 144)) {
                tracks[currTrack].decOffset();
            }
            if ((msg.data2 == 100) && (msg.data1 == 144)) {
                tracks[currTrack].incOffset();
            }

            // mute / unmute
            if ((msg.data2 == 91) && (msg.data1 == 144)) {
                tracks[currTrack].unmute();
            }
            if ((msg.data2 == 92) && (msg.data1 == 144)) {
                tracks[currTrack].mute();
            }

            // select clapping seq
            if (msg.data2 == 53) {
                if ((msg.data1 >= 144) && (msg.data1 <= 151)) {
                    tracks[currTrack].selectClappingSeq(msg.data1 - 144);
                }
            }

            // select phase
            if (msg.data2 == 52) {
                if (msg.data1 == 144)
                    tracks[currTrack].phase(50);
                if (msg.data1 == 145)
                    tracks[currTrack].phase(25);
                if (msg.data1 == 146)
                    tracks[currTrack].phase(10);
                if (msg.data1 == 147)
                    tracks[currTrack].phase(5);
                if (msg.data1 == 148)
                    tracks[currTrack].phase(4);
            }*/
        }
    }
}

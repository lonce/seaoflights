/* GLOBALS */
OscSend xmitters[12];
Track tracks[12];

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

main();

fun void main() {
    initNetwork();

    100 => float bpm;

    <<< "Initialing left section" >>>;
    for (0 => int i; i < leftSection.cap(); i++) {
        leftSection[i] => int id;
        <<< id >>>;
        tracks[id].init(id, xmitters[id], bpm);
        tracks[id].play();
        tracks[id].loadSequence(0);
        tracks[id].unmute();
    }
    <<< "Initialing center section" >>>;
    for (0 => int i; i < centerSection.cap(); i++) {
        centerSection[i] => int id;
        tracks[id].init(id, xmitters[id], bpm);
        tracks[id].play();
        tracks[id].loadSequence(1);
        tracks[id].unmute();
    }
    <<< "Initialing right section" >>>;
    for (0 => int i; i < rightSection.cap(); i++) {
        rightSection[i] => int id;
        tracks[id].init(id, xmitters[id], bpm);
        tracks[id].play();
        tracks[id].loadSequence(2);
        tracks[id].unmute();
    }

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

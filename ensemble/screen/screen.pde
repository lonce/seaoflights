import oscP5.*;
import de.looksgood.ani.*;

OscP5 oscP5;
float col = 0.0;

int id = -1;

void setup() {
  frameRate(25);
  colorMode(RGB, 256, 256, 256, 100);
  // fullscreen(1);
  size(1600, 900);

  /* start oscP5, listening for incoming messages at port 12000 */
  oscP5 = new OscP5(this, 12000);

  Ani.init(this);

  /* myRemoteLocation is a NetAddress. a NetAddress takes 2 parameters,
   * an ip address and a port number. myRemoteLocation is used as parameter in
   * oscP5.send() when sending osc packets to another computer, device,
   * application. usage see below. for testing purposes the listening port
   * and the port of the remote location address are the same, hence you will
   * send messages back to this sketch.
   */

  /* osc plug service
   * osc messages with a specific address pattern can be automatically
   * forwarded to a specific method of an object. in this example
   * a message with address pattern /test will be forwarded to a method
   * test(). below the method test takes 2 arguments - 2 ints. therefore each
   * message with address pattern /test and typetag ii will be forwarded to
   * the method test(int theA, int theB)
   */
  oscP5.plug(this, "fadeIn", "/screen/fadeIn");
  oscP5.plug(this, "fadeOut", "/screen/fadeOut");
}

public void fadeIn(float dur) {
  Ani.to(this, dur, "col", 100);
}

public void fadeOut(float dur) {
  Ani.to(this, dur, "col", 0);
}

void draw() {
  background(0);
  // color c = color(255, 204, 0);
  noStroke();
  fill(255, 204, 0, col);
  rect(0, 0, 1600, 900);
}

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  /* with theOscMessage.isPlugged() you check if the osc message has already been
   * forwarded to a plugged method. if theOscMessage.isPlugged()==true, it has already
   * been forwared to another method in your sketch. theOscMessage.isPlugged() can
   * be used for double posting but is not required.
  */
  if(theOscMessage.isPlugged()==false) {
  /* print the address pattern and the typetag of the received OscMessage */
  println("### received an osc message.");
  println("### addrpattern\t"+theOscMessage.addrPattern());
  println("### typetag\t"+theOscMessage.typetag());
  }
}
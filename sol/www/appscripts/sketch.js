function setup(){
  createCanvas(500,500,WEBGL);
  ortho(-width, width, height, -height/2, 0.1, 100);
}
function draw(){
  box(30);
  translate(100,100,-100);
  rotate(PI/4, [1,1,0]);
  box(30);
}
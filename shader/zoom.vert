precision mediump float;

attribute vec2 position;
varying vec2 vUv;

void main() {
  vec2 newPos = 2.0*position+vec2(0.2,-0.2);
  vUv = (position + vec2(1.0)) / 2.0;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(newPos, 1.0, 1.0);
}
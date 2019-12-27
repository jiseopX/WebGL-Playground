precision mediump float;

attribute vec2 position;
varying vec2 vUv;
uniform float t;

void main() {
  vec2 newPos = position;
  newPos.x +=abs(sin(t));
  vUv = (position + vec2(1.0)) / 2.0;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(newPos, 1.0, 1.0);
}
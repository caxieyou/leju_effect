#define GLSLIFY 1
varying vec4 coord;
varying vec2 offsetCoord[4];

uniform vec2 step;
uniform float zoom;

void main() {
  coord = a_TexCoord;

    offsetCoord[0] = coord.xy + vec2(0.0, -step.y);
    offsetCoord[1] = coord.xy + vec2(-step.x, 0.0);
    offsetCoord[2] = coord.xy + vec2(step.x, 0.0);
    offsetCoord[3] = coord.xy + vec2(0.0, step.y);

  gl_Position = u_ModelViewProjectionMatrix * a_Vertex;
}
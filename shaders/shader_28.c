#define GLSLIFY 1
varying vec4 coord;
varying vec4 backgroundCoords;

uniform mat4 backgroundMatrix;

void main() {
  coord = a_TexCoord;
  backgroundCoords = backgroundMatrix * a_Vertex * 0.5 + 0.5;
  gl_Position = u_ModelViewProjectionMatrix * a_Vertex;
}
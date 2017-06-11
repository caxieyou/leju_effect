#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform mat4 cropMatrix;
uniform mat4 viewMatrix;

void main() {
  coord = a_TexCoord;
  compositeCoord = viewMatrix * cropMatrix * a_Vertex * 0.5 + 0.5;
  gl_Position = u_ModelViewProjectionMatrix * a_Vertex;
}
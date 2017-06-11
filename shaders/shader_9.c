#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform mat4 viewMatrix;

void main() {
  compositeCoord = a_TexCoord;
  coord = viewMatrix * a_Vertex * 0.5 + 0.5;
  gl_Position = viewMatrix * a_Vertex;
}
"
 
"#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform float contrast;

const mat3 matRGBtoROMM = mat3(0.5293459296226501, 0.3300727903842926, 0.14058130979537964, 0.09837432950735092, 0.8734610080718994, 0.028164653107523918, 0.01688321679830551, 0.11767247319221497, 0.8654443025588989);
const mat3 matROMMtoRGB = mat3(2.0340757369995117, -0.727334201335907, -0.3067416846752167, -0.22881317138671875, 1.2317301034927368, -0.0029169507324695587, -0.008569774217903614, -0.1532866358757019, 1.1618564128875732);

void main() {
  lowp vec4 col = texture2D(texture, coord.xy);

    float amount = (contrast < 0.0) ? contrast / 2.0 : contrast;

    vec3 base = col.rgb * matRGBtoROMM;
  vec3 blend = mix(vec3(0.5), base, amount * col.a);
  // overlay blend
  vec3 res = mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));

  res = res * matROMMtoRGB;

    gl_FragColor = vec4(res, col.a);

}
#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform sampler2D texture;
uniform sampler2D blurTexture;

void main() {

  lowp vec4 blur = texture2D(blurTexture, compositeCoord.xy);
  lowp vec4 col = texture2D(texture, coord.xy);

  lowp float mask = min(blur.a / 0.05, 1.0);
  lowp vec3 res = mix(col.rgb, blur.rgb, mask);

    gl_FragColor = vec4(res, col.a);
}
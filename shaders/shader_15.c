#define GLSLIFY 1
varying vec4 coord;
varying vec2 distortionCoord;

uniform sampler2D texture;
uniform sampler2D denoiseMap;
uniform sampler2D dehazeMap;
uniform float color_denoise;
uniform float luminance_denoise;

float Lum(in vec3 color){
    return dot(color, vec3(0.298839, 0.586811, 0.11435));
}

vec3 ClipColor(in vec3 c){
  float l = Lum(c);
  float n = min(min(c.r, c.g), c.b);
  float x = max(max(c.r, c.g), c.b);

  if (n < 0.0) c = (c-l)*l / (l-n) + l;
  if (x > 1.0) c = (c-l) * (1.0-l) / (x-l) + l;

  return c;
}

vec3 SetLum(in vec3 c, in float l){
  float d = l - Lum(c);

  return ClipColor(c + d);
}

void main() {
    lowp vec3 col = texture2D(texture, coord.xy).rgb;
  lowp vec4 denoiseTexture = texture2D(denoiseMap, distortionCoord);
  lowp vec4 dehazeTexture = texture2D(dehazeMap, distortionCoord);

  // blend dehazeTexture with darker (noisier) of denoise map
  float lumMask = exp(-3.0 * Lum(denoiseTexture.rgb));

  // mask edges from luminance denoise (edges stored in alpha channel)
  float luminance_blend = max(luminance_denoise - pow(denoiseTexture.a, 0.5), 0.0);
  float color_blend = color_denoise;

  vec4 lumMap = mix(denoiseTexture, dehazeTexture, luminance_denoise * lumMask);
  vec4 colorMap = mix(denoiseTexture, dehazeTexture, color_denoise * lumMask);

  // color denoise
  col = mix(col, SetLum(colorMap.rgb, Lum(col)), color_denoise);
  // luminance denoise
  col = mix(col, SetLum(col, Lum(lumMap.rgb)), luminance_blend);
  
  gl_FragColor = vec4(col, 1.0);
}
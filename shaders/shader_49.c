#define GLSLIFY 1
varying vec4 coord;
varying vec4 backgroundCoords;

uniform sampler2D texture;
uniform sampler2D layerTexture;
uniform vec4 colorOverlay;
uniform float opacity;
uniform float blendMode;
uniform float blendMix;

vec3 blendDifference(in vec3 base, in vec3 blend, in float fill) {
  return abs(base - blend * fill);
}

float blendColorDodge(in float base, in float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

float blendColorBurn(in float base, in float blend) {
    return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

float blendVividLight(in float base, in float blend) {
    return (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));
}

vec3 blendVividLight(in vec3 base, in vec3 blend, in float fill) {
  blend = mix(vec3(0.5), blend, fill);
    return vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));
}

void main() {
  lowp vec3 base = texture2D(texture, backgroundCoords.xy).rgb;
  lowp vec4 layer = texture2D(layerTexture, coord.xy);
  lowp vec3 blend = mix(layer.rgb, colorOverlay.rgb, colorOverlay.a);
  lowp vec3 overlay;

  float mixA = min(1.0, (1.0 - abs(blendMix)) * 1.333);
  float mixB =  min(1.0, abs(blendMix) * 4.0);

  overlay = (blendMix > 0.0) ? blendVividLight(base, blend, mixA) : blendDifference(base, blend, mixA);
  blend = mix(blend, overlay, mixB);

  if (blendMode == 22.0) blend = base; // passthrough

    gl_FragColor = vec4(blend, layer.a * opacity);
}
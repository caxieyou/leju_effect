#define GLSLIFY 1
// fragment_dehazemap1.cpp
// usage: use before rendering to generate map, get transmission map prior from image
// input: uniform sampler2D texture (image loaded)
// output: rgb from image, alpha channel represent the transmission computed from darkchannel
// ref: http://research.microsoft.com/en-us/um/people/jiansun/papers/dehaze_cvpr2009.pdf

varying vec4 coord;

uniform sampler2D texture;

float random(in vec3 scale, in float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

const float filter_window = 0.01;
const float sample_radius = 5.0;
const float wsize = filter_window/sample_radius/2.0;
const vec2 delta = vec2(0.9, -0.1);

void main() {
    vec2 uv;
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    lowp vec3 base = texture2D(texture, coord.xy).rgb;
    lowp float min_color = 1.0;
    lowp vec4 sample_neighbor;

    for (int i = -5; i <= 5; i++) {
        uv = coord.xy + (vec2(float(i)) * delta + offset - 0.5) * wsize;
        sample_neighbor = texture2D(texture, uv);
        min_color = min(min(min(
          min_color,
          sample_neighbor.r),
          sample_neighbor.g),
          sample_neighbor.b);
    }

    gl_FragColor = vec4(base, min_color);
}
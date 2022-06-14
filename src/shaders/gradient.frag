uniform vec2 iResolution;
uniform vec4 iMouse;
uniform vec3 u_colors[5];
uniform int u_colorsCount;

#define SRGB_TO_LINEAR(c) pow((c), vec3(2.2))
#define LINEAR_TO_SRGB(c) pow((c), vec3(1.0 / 2.2))
#define SRGB(r, g, b) SRGB_TO_LINEAR(vec3(float(r), float(g), float(b)) / 255.0)

const vec3 COLOR0 = SRGB(255, 0, 114);
const vec3 COLOR1 = SRGB(197, 255, 80);
const vec3 COLOR2 = SRGB(5, 200, 12);

const int COUNT = 5;
const float COUNTf = float(COUNT);

void main()
{

    vec2 offsets[COUNT];
    
    // define regular offsets
    for(int i = 0; i < COUNT; i++) {
        float o = float(i) / (COUNTf - 1.0);
        offsets[i] = vec2(o * iResolution.x, ((COUNTf - 1.0) - o) * iResolution.y);
    }

    // Calculate interpolation factor with vector projection.

    vec3 color = SRGB_TO_LINEAR(u_colors[0]);
    
    for(int i = 0; i < COUNT - 1; i++) {
        vec2 diff = offsets[i] - offsets[i + 1];
        float start = offsets[i].x * offsets[i].y;
        float end = offsets[i+1].x * offsets[i+1].y;
        color = mix(color, SRGB_TO_LINEAR(u_colors[i+1]), smoothstep(start, end, gl_FragCoord.x * gl_FragCoord.y * COUNTf));
    }
    // Convert color from linear to sRGB color space (=gamma encode).
    color = LINEAR_TO_SRGB(color);

    gl_FragColor = vec4(color, 1.0);
}

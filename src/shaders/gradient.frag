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

// Gradient noise from Jorge Jimenez's presentation:
// http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare
float gradientNoise(in vec2 uv)
{
    const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));
}

void main()
{
    vec2 a; // First gradient point.
    vec2 b; // Second gradient point.
    vec2 c;
    // if (iMouse == vec4(0.0)) {
        a = vec2(0, iResolution.y);
        b = iResolution.xy / 2.0;
        c = vec2(iResolution.x, 0);

    vec2 offsets[COUNT];
    

    for(int i = 0; i < COUNT; i++) {
        float o = float(i) / (COUNTf - 1.0);
        offsets[i] = vec2(o * iResolution.x, ((COUNTf - 1.0) - o) * iResolution.y);
    }

    // vec2 Diff = offsets[COUNT];
    // for(int i = COUNT; i > 0; i--) {
    //    Diff -= offsets[i];
    //}
        
    // } else {
    //     a = abs(iMouse.zw);
    //     b = iMouse.xy;
    // }

    // Calculate interpolation factor with vector projection.
    vec2 cba = c - a;
    float t = dot(gl_FragCoord.xy - a, cba) / dot(cba, cba);
    // Saturate and apply smoothstep to the factor.
    //t = smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0));
    // Interpolate.
    

    vec3 color = SRGB_TO_LINEAR(u_colors[0]);
    //float t;
    
    for(int i = 0; i < COUNT - 1; i++) {
        vec2 diff = offsets[i] - offsets[i + 1];
        //t = dot(gl_FragCoord.xy - offsets[i], diff) / dot(diff, diff);
        //t = smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0));
        float start = offsets[i].x * offsets[i].y;
        float end = offsets[i+1].x * offsets[i+1].y;
        color = mix(color, SRGB_TO_LINEAR(u_colors[i+1]), smoothstep(start, end, gl_FragCoord.x * gl_FragCoord.y * COUNTf));
    }

    // vec3 color = mix(mix(COLOR0, COLOR1, t), COLOR2, t);
    // vec3 color = COLOR0 * t * 0.1 +
    //     COLOR1 * t * 0.3 +
    //     COLOR2 * t * 0.6;

    // Convert color from linear to sRGB color space (=gamma encode).
    color = LINEAR_TO_SRGB(color);
    

    // Add gradient noise to reduce banding.
    //color += (1.0/255.0) * gradientNoise(fragCoord) - (0.5/255.0);

    gl_FragColor = vec4(color, 1.0);
}

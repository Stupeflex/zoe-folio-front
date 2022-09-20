uniform vec2 iResolution;
uniform vec4 iMouse;
uniform vec3 u_colors[5];
uniform int u_colorsCount;

vec3 srgbToLinear(vec3 source)
{
    return pow(source, vec3(2.2));
}

vec3 linearToSrgb(vec3 source)
{
    return pow(source, vec3(1.0 / 2.2));
}

vec3 srgb(int r, int g, int b)
{
    return srgbToLinear(vec3(float(r), float(g), float(b)) / 255.0);
}

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

    vec3 color = srgbToLinear(u_colors[0]);
    
    for(int i = 0; i < COUNT - 1; i++) {
        vec2 diff = offsets[i] - offsets[i + 1];
        float start = offsets[i].x * offsets[i].y;
        float end = offsets[i+1].x * offsets[i+1].y;
        color = mix(color, srgbToLinear(u_colors[i+1]), smoothstep(start, end, gl_FragCoord.x * gl_FragCoord.y * COUNTf));
    }
    // Convert color from linear to sRGB color space (=gamma encode).
    color = linearToSrgb(color);

    gl_FragColor = vec4(color, 1.0);
}

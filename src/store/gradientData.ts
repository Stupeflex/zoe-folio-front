import { defineStore } from 'pinia';
import gsap from 'gsap';
import { formatRgbaString, rgbColor, Vec3 } from '@/utils/gradient';
import {
  hexToRgb,
  vec3ArrayToUniforms,
  rgbToVec3,
  extractRgbaFromString,
  defaultPalette,
} from '@/utils/gradient';

type color = string;

type GradientState = {
  colors: rgbColor[];
  defaultColors: rgbColor[];
  targetColors: rgbColor[];
};

export type hexComponent =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f';

const killAllTweens = () => gsap.globalTimeline.clear();

export const useGradientData = defineStore('gradientData', {
  state: (): GradientState => ({
    colors: [...defaultPalette],
    defaultColors: [...defaultPalette],
    targetColors: ['#111114', '#D18D24', '#539A84', '#223', '#111114'].map(
      (hex) => hexToRgb(hex)
    ),
    //colors: ['#F00', '#00f', '#00f', '#ff0', '#000'],
  }),
  getters: {
    uniforms(state: GradientState): number[] {
      return vec3ArrayToUniforms(state.colors.map((color) => rgbToVec3(color)));
    },
  },
  actions: {
    setColors(colors: color[], transition = false) {
      if (colors.length === this.colors.length) {
        killAllTweens();
        this.targetColors = colors.map((hex) => hexToRgb(hex));
        if (transition) {
          colors.forEach((targetColor, index) => {
            const c = this.colors[index];
            const tmp = { color: formatRgbaString(c) };
            gsap.to(tmp, {
              color: targetColor,
              duration: 2,
              onUpdate: () => {
                this.colors[index] =
                  tmp.color[0] === '#'
                    ? hexToRgb(tmp.color)
                    : extractRgbaFromString(tmp.color);
              },
            });
          });
        } else {
          this.colors = colors.map((hex) => hexToRgb(hex));
        }
      } else {
        throw new Error('color count not matched');
      }
    },
    setColorsRgb(colors: rgbColor[], transition = false) {
      if (colors.length === this.colors.length) {
        killAllTweens();
        this.targetColors = colors;
        this.updateHTMLBackgroundColor();
        if (transition) {
          colors.forEach((targetColor, index) => {
            const c = this.colors[index];
            const tmp = { color: `rgba(${c[0]},${c[1]},${c[2]},${c[3] || 1})` };
            gsap.to(tmp, {
              color: formatRgbaString(targetColor),
              duration: 2,
              onUpdate: () => {
                this.colors[index] =
                  tmp.color[0] === '#'
                    ? hexToRgb(tmp.color)
                    : extractRgbaFromString(tmp.color);
              },
            });
          });
        } else {
          this.colors = colors;
        }
      } else {
        throw new Error('color count not matched');
      }
    },

    resetDefaultColors(transition = false) {
      killAllTweens();
      this.targetColors = this.defaultColors;
      this.updateHTMLBackgroundColor();
      if (transition) {
        [...this.defaultColors].forEach((targetColor, index) => {
          const c = this.colors[index];
          const tmp = { color: `rgba(${c[0]},${c[1]},${c[2]},${c[3] || 1})` };
          gsap.to(tmp, {
            color: formatRgbaString(targetColor),
            duration: 1,
            onUpdate: () => {
              this.colors[index] =
                tmp.color[0] === '#'
                  ? hexToRgb(tmp.color)
                  : extractRgbaFromString(tmp.color);
            },
          });
        });
      } else {
        this.colors = [...this.defaultColors];
      }
    },
    updateHTMLBackgroundColor() {
      const html = document.body.parentElement;
      if (html) {
        const [r, g, b] = this.targetColors[2];
        html.style.background = `rgb(${r}, ${g}, ${b})`;
        document.body.style.background = `rgb(${r}, ${g}, ${b})`;
      }
    },
  },
  // setColorAtIndex(color: color, index: number, transition = false) {
  //   if (index < this.colors.length) {
  //     if (transition) {
  //       const newColors = [...this.colors];
  //       newColors[index] = color;
  //       gsap.to(this.colors, {
  //         endArray: newColors,
  //         duration: 2,
  //       });
  //     } else {
  //       this.colors[index] = color;
  //     }
  //   }
  // },
});

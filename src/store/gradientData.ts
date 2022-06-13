import { defineStore } from "pinia";



type color = string;

type GradientState = {
  colors: color[];
  targetColors: color[];
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type hexComponent = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

// export type hexColor = `#${hexComponent}${hexComponent}${hexComponent}${hexComponent}${hexComponent}${hexComponent}`;

export const hexToVec3 = (color: string): Vec3 => {
  if(color[0] === '#') {
    color = color.slice(1);
  }
  if(color.length === 3) {
    return {
      x: parseInt(color[0], 16) / 15,
      y: parseInt(color[1], 16) / 15,
      z: parseInt(color[2], 16) / 15,
    }
  }
  if(color.length === 6) {
    return {
      x: parseInt(color.slice(0, 2), 16) / 255,
      y: parseInt(color.slice(2, 4), 16) / 255,
      z: parseInt(color.slice(4, 6), 16) / 255,
    }
  }
  throw new Error('unsupported string provided to HexToVec3')
}

export const vec3ArrayToUniforms = (vectors: Vec3[]) => {
  return vectors.reduce((acc: number[], vec: Vec3,): number[] => [...acc, ...[vec.x, vec.y, vec.z ]], [])

}

export const useGradientData = defineStore('gradientData', {
  state: (): GradientState => ({
    colors: ['#111114', '#D18D24', '#539A84', '#223', '#111114'],
    targetColors: ['#111114', '#D18D24', '#539A84', '#223', '#111114'],
    //colors: ['#F00', '#00f', '#00f', '#ff0', '#000'],
  }),
  getters: {
    uniforms(state): number[] {
      return vec3ArrayToUniforms(state.colors.map(color => hexToVec3(color)));
    }
  },
  actions: {
    setColors(colors: color[]) {
      this.colors = colors;
    },
    setColorAtIndex(color: color, index: number) {
      if(index < this.colors.length) {
        this.colors[index] = color;
      }
    }
  }
});


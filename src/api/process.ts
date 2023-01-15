import client from '@/api/client';
import { ProcessData, ProcessData__Raw } from '@/api/types';
import process1Animation from '@/assets/animations/process1.json';
import process2Animation from '@/assets/animations/process2.json';
import process3Animation from '@/assets/animations/process3.json';

export const fetchProcessData = (): Promise<ProcessData> =>
  client('/process-section?populate=*-nested').then((raw: ProcessData__Raw) =>
    formatProcessData(raw)
  );

const animations = [
  process1Animation,
  process2Animation,
  process3Animation,
  process3Animation,
] as const;

const formatProcessData = (raw: ProcessData__Raw): ProcessData => {
  return {
    hook: raw.data.attributes.hook,
    steps: raw.data.attributes.steps.map((step, index) => ({
      title: step.title,
      content: step.content,
      index,
      animation: animations[index],
      translate: {
        x: 0,
        y: 0,
      },
      size: {},
    })),
  };
};

import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  Breakpoint,
  columns,
  currentBreakPoint,
  rows,
  unit,
  responsiveValue,
} from '@/utils/responsive';
import { setAppHeight } from '@/utils/format';

interface ResponsiveValueMap<T = number> {
  mobile: T;
  tablet: T;
  default: T;
}

export const useResponsiveData = defineStore('responsiveData', () => {
  const c = ref(columns());
  const r = ref(rows());
  const u = ref(unit());
  const b = ref(currentBreakPoint());
  const navHeight = ref<number>(40);
  const appHeight = ref(window.innerHeight + 'px');

  const update = () => {
    b.value = currentBreakPoint();
    c.value = columns();
    r.value = rows();
    u.value = unit();
    appHeight.value = setAppHeight();
  };

  const getValue = <T = number>(
    values: ResponsiveValueMap<T>,
    breakpoint?: Breakpoint
  ): T => {
    return responsiveValue(values, breakpoint ?? b.value);
  };

  const setNavHeight = (h: number) => {
    navHeight.value = h;
  };

  return {
    columns: c,
    rows: r,
    breakpoint: b,
    unit: u,
    navHeight,
    update,
    getValue,
    setNavHeight,
  };
});

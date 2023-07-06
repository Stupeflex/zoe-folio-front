export type Breakpoint = 'mobile' | 'tablet' | 'default';

export const breakpoints: { [key in Breakpoint]: number } = {
  mobile: 700,
  tablet: 1300,
  default: 1920,
};

type ResponsiveMap = {
  [k: string]: {
    mobile: number;
    tablet: number;
    default: number;
  };
};

export const responsiveMap: ResponsiveMap = {
  unit: {
    mobile: 8,
    tablet: 12,
    default: 12,
  },
  columns: {
    mobile: 10,
    tablet: 15,
    default: 19,
  },
  rows: {
    mobile: 17,
    tablet: 14,
    default: 12,
  },
  widthOffset: {
    mobile: 3,
    tablet: 3,
    default: 0,
  },
  thumbnailScale: {
    default: 1,
    tablet: 0.9,
    mobile: 0.7,
  },
};

export const gridRatios = {
  columns: {
    default: 1,
    tablet: responsiveMap.columns.default / responsiveMap.columns.tablet + 0.5,
    mobile: responsiveMap.columns.default / responsiveMap.columns.mobile,
  },
  rows: {
    default: 1,
    tablet: responsiveMap.rows.tablet / responsiveMap.rows.default,
    mobile: responsiveMap.rows.mobile / responsiveMap.rows.default,
  },
};

interface ResponsiveValueMap<T = number> {
  mobile: T;
  tablet: T;
  default: T;
}

export const currentBreakPoint = (): Breakpoint => {
  const w = window.innerWidth;
  return w <= breakpoints.mobile
    ? 'mobile'
    : w <= breakpoints.tablet
      ? 'tablet' // eslint-disable-line prettier/prettier
      : 'default'; // eslint-disable-line prettier/prettier
};

export const unit = (b?: Breakpoint) =>
  responsiveMap.unit[b ?? currentBreakPoint()];
export const columns = (b?: Breakpoint) =>
  responsiveMap.columns[b ?? currentBreakPoint()];
export const rows = (b?: Breakpoint) =>
  responsiveMap.rows[b ?? currentBreakPoint()];

export const cellWidth = () =>
  (window.innerWidth - unit()) / columns() - unit();
export const cellHeight = () => (window.innerHeight - unit()) / rows() - unit();
export const cssUnit = (multiplier = 1) => `calc(${unit()}px * ${multiplier})`;
export const cssCellWidth = (multiplier = 1, isPosition?: boolean) =>
  `calc(((100vw - ${cssUnit()}) / ${columns()} - ${cssUnit()}) * ${multiplier} + ${cssUnit()} * ${Math.max(
    multiplier - 1,
    0
  )} ${isPosition && multiplier > 0 ? ` + ${cssUnit()}` : ''})`;
export const cssCellHeight = (multiplier = 1, isPosition?: boolean) =>
  `calc(((var(--app-height) - ${cssUnit()}) / ${rows()} - ${cssUnit()}) * ${multiplier} + ${cssUnit()} * ${Math.max(
    multiplier - 1,
    0
  )} ${isPosition && multiplier > 0 ? ` + ${cssUnit()}` : ''})`;

export const responsiveValue = <T = number>(
  values: ResponsiveValueMap<T>,
  breakpoint?: Breakpoint
): T => {
  return values[breakpoint ?? currentBreakPoint()];
};

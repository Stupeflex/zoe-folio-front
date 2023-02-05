import { Dimensions, Size } from '@/utils/grid.v2/types';
import { responsiveMap } from '@/utils/responsive';
import { isDefined } from '@/utils/math';

export const convertSizeToResponsive = (
  initialSize: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  },
  gridWidth: number,
  gridHeight: number
): Dimensions | Size => {
  // assume layout was made for desktop in project editor
  const desktopGridWidth = responsiveMap.columns.default - 2;
  const desktopGridHeight = responsiveMap.rows.default;
  // return early if no conversion necessary
  if (gridWidth === desktopGridWidth) return initialSize;
  // define decimal to fixed number conversion function
  const isMobile = gridWidth === responsiveMap.columns.mobile;
  const roundFn = isMobile ? Math.floor : Math.round;
  // compute new width and height based on current grid width
  const widthRatio = initialSize.width / desktopGridWidth;
  const heightRatio = initialSize.height / gridHeight;
  const responsiveWidth = gridWidth * widthRatio;
  const responsiveHeight = desktopGridHeight * heightRatio;
  const gridHeightRatio = desktopGridHeight / gridHeight;
  // if x and y are defined, compute responsive values for those as well
  if (isDefined(initialSize.x) && isDefined(initialSize.y)) {
    const xRatio = initialSize.x / desktopGridWidth;
    const yRatio = initialSize.y / desktopGridWidth;
    const responsiveX = gridWidth * xRatio;
    const responsiveY = gridWidth * yRatio;
    // return full dimensions
    return {
      width: (isMobile ? Math.round : Math.floor)(responsiveWidth),
      height: Math.round(responsiveHeight - gridHeightRatio),
      x: roundFn(responsiveX),
      y: Math.ceil(responsiveY),
    };
  }
  // return only size
  return {
    width: roundFn(responsiveWidth),
    height: roundFn(responsiveHeight),
  };
};

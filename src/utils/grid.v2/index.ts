import {
  GridLayoutOptions,
  GridItem,
  GridLayoutData,
  GridMatrix,
  Size,
  Dimensions,
} from '@/utils/grid.v2/types';
import { columns, rows } from '@/utils/responsive';
import { normalizeGridItems } from '@/utils/grid.v2/items';
import {
  createMatrix,
  fillMatrix,
  getMatrixMaxSize,
  trimMatrix,
} from '@/utils/grid.v2/matrix';
import { placeAllItems } from './position';
import { getGridLayoutDimensions } from '@/utils/grid.v2/layout';
import { isDefined } from '@/utils/math';

export const defaultGridOptions: GridLayoutOptions = {
  rows: rows(),
  columns: columns(),
  marginX: 0,
  marginY: 0,
  axis: 'x',
  reservedSpace: [],
  fillAvailable: false,
  bottomPadding: false,
};

const prefillReservedSpace = (
  matrix: GridMatrix,
  matrixSize: Size,
  reservedSpace: Dimensions[],
  options: GridLayoutOptions
) => {
  reservedSpace.forEach((space) => {
    fillMatrix(
      matrix,
      matrixSize,
      space,
      options.marginX,
      options.marginY,
      false,
      true
    );
  });
};

export const generateGridLayout = (
  items: Partial<GridItem>[],
  opts: Partial<typeof defaultGridOptions>
): GridLayoutData => {
  const options = Object.assign({}, defaultGridOptions, opts);
  const normalizedItems = normalizeGridItems(items);

  let matrixSize = getMatrixMaxSize(normalizedItems, options);

  const matrix = createMatrix(matrixSize);
  if (isDefined(options.reservedSpace)) {
    prefillReservedSpace(matrix, matrixSize, options.reservedSpace, options);
  }
  const placedItems = placeAllItems(
    matrix,
    matrixSize,
    normalizedItems,
    options
  );
  console.log(options);
  matrixSize = trimMatrix(matrix, matrixSize, options);
  // logMatrix(matrix, matrixSize);
  const layoutDimensions = getGridLayoutDimensions(matrixSize);

  return { items: placedItems, matrix, matrixSize, layoutDimensions };
};

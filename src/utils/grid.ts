import { Vector2 } from '@/utils/gestures';
import { identifier } from '@/store/projectData';
import {
  cellHeight,
  cellWidth,
  cssCellHeight,
  cssCellWidth,
  unit,
} from '@/utils/responsive';

type Required<T> = T extends object
  ? { [P in keyof T]-?: NonNullable<T[P]> }
  : T;

type Nullish<T extends Record<string, unknown>> = {
  [P in keyof T]?: T[P] | undefined;
};

export interface Size {
  width: number;
  height: number;
}

export type Axis = 'x' | 'y';

export interface GridItem<TData = unknown> extends Vector2, Size {
  id: identifier;
  extraData?: TData;
}

export type PartialGridItem<TData = unknown> = Partial<GridItem<TData>>;

export interface GridProps {
  items: Partial<GridItem>[];
  rows?: number;
  columns?: number;
  marginX?: number;
  marginY?: number;
  axis?: Axis;
  reservedSpace?: Dimensions[];
}

export interface ItemPosition extends Vector2 {
  pinnedX?: number;
  pinnedY?: number;
}

export interface GridItemWithPosition extends GridItem, ItemPosition {
  isPinned?: boolean;
}

export type GridLayoutOptions = Required<Omit<GridProps, 'items'>>;

export const defaultGridOptions: GridLayoutOptions = {
  rows: 12,
  columns: 19,
  marginX: 0,
  marginY: 0,
  axis: 'x',
  reservedSpace: [],
};

export const defaultGridItemSize: Size = {
  width: 5,
  height: 3,
};

export const borders = ['top', 'left', 'right', 'bottom'] as const;

export type Border = typeof borders[number];

export const corners: Border[][] = [
  ['top', 'right'],
  ['top', 'left'],
  ['bottom', 'right'],
  ['bottom', 'left'],
];

export interface BorderEditData {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

type Matrix = (0 | 1 | 2 | 3 | 4)[][]; // 0: free cell; 1: filled cell: 2: pinned cell; 3: margin; 4: reserved cell;

const fitLengthInLine = (
  line: Matrix[number],
  length: number,
  start = 0,
  margin = 0
): number | undefined => {
  let countStart = start;
  let count = 0;
  for (let i = countStart; i < line.length + margin * 2; i++) {
    const cell = line[i];
    const isFreeCell = cell === 0;

    if (isFreeCell || (count === length - 1 + margin && cell === 3)) {
      count++;
    } else {
      countStart = i + 1;
      count = 0;
    }
    if (
      count === length ||
      (count + margin >= length + margin - 1 && cell === undefined)
    )
      return countStart;
  }
  return undefined;
};

const findItemPositionAxisY = (
  matrix: Matrix,
  item: Size,
  startX = 0,
  startY = 0,
  marginX = 0,
  marginY = 0
) => {
  let xPos = startX;
  let yPos = startY;
  let xCount = -marginX;
  for (let x = startX; x < matrix.length; x++) {
    const possibleRowStart = fitLengthInLine(
      matrix[x],
      item.height,
      yPos,
      marginY
    );
    if (possibleRowStart !== undefined) {
      yPos = possibleRowStart;
      xCount++;
    } else {
      xPos = x + 1;
      xCount = 0;
      yPos = 0;
    }
    if (xCount === item.width + marginX) return { x: xPos, y: yPos };
  }
  return undefined;
};

const findItemPositionAxisX = (
  flippedMatrix: Matrix,
  item: Size,
  startX = 0,
  startY = 0,
  marginX = 0,
  marginY = 0
) => {
  let xPos = startX;
  let yPos = startY;
  let yCount = -marginY;
  for (let x = startX; x < flippedMatrix.length; x++) {
    const possibleColumnStart = fitLengthInLine(
      flippedMatrix[x],
      item.width,
      xPos,
      marginX
    );
    if (possibleColumnStart !== undefined) {
      xPos = possibleColumnStart;
      yCount++;
    } else {
      yPos = x + 1;
      yCount = 0;
      xPos = 0;
    }
    if (yCount === item.height + marginY) return { x: xPos, y: yPos };
  }
  return undefined;
};

const isFreeCell = (matrix: Matrix, pos: Vector2): boolean => {
  const cell = matrix[pos.x][pos.y];
  return cell === 0 || cell === 3;
};

const findItemPosition = (
  matrix: Matrix,
  item: Size,
  startX = 0,
  startY = 0,
  marginX = 0,
  marginY = 0,
  axis: Axis,
  givenX?: number,
  givenY?: number
): Vector2 | undefined => {
  const generatedPos =
    axis === 'y'
      ? findItemPositionAxisY(matrix, item, startX, startY, marginX, marginY)
      : findItemPositionAxisX(
        flipMatrix(matrix), // eslint-disable-line prettier/prettier
        item, // eslint-disable-line prettier/prettier
        startX, // eslint-disable-line prettier/prettier
        startY, // eslint-disable-line prettier/prettier
        marginX, // eslint-disable-line prettier/prettier
        marginY // eslint-disable-line prettier/prettier
      ); // eslint-disable-line prettier/prettier

  const useGivenX =
    givenX !== undefined &&
    (givenX + item.width <= matrix.length - 1 || axis === 'y');
  const useGivenY =
    givenY !== undefined &&
    (givenY + item.height <= matrix[0].length - 1 || axis === 'x');

  const x = useGivenX
    ? givenX
    : generatedPos && generatedPos.x !== undefined
      ? generatedPos.x // eslint-disable-line prettier/prettier
      : undefined; // eslint-disable-line prettier/prettier
  const y = useGivenY
    ? givenY
    : generatedPos && generatedPos.y !== undefined
      ? generatedPos.y // eslint-disable-line prettier/prettier
      : undefined; // eslint-disable-line prettier/prettier

  // check if mixed pos is not already taken in grid
  if (x === undefined || y === undefined) return undefined;

  const pos = isFreeCell(matrix, { x, y }) ? { x, y } : generatedPos;
  if (pos === undefined) return undefined;

  return pos;
};

const fillMatrix = (
  matrix: Matrix,
  item: Dimensions,
  marginX: number,
  marginY: number,
  isPinned?: boolean,
  isReserved?: boolean
) => {
  const xStart = item.x - marginX;
  const yStart = item.y - marginY;
  const xEnd = item.x + item.width + marginX;
  const yEnd = item.y + item.height + marginY;
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      const col = Math.max(Math.min(x, matrix.length - 1), 0);
      const row = Math.max(Math.min(y, matrix[col].length - 1), 0);
      const currentCell = matrix[col][row];

      matrix[col][row] = isReserved
        ? 4
        : currentCell !== 0 && currentCell !== 3
          ? currentCell // eslint-disable-line prettier/prettier
          : x < item.x || // eslint-disable-line prettier/prettier
          y < item.y ||
          x >= item.x + item.width ||
          y >= item.y + item.height
            ? 3 // eslint-disable-line prettier/prettier
            : isPinned // eslint-disable-line prettier/prettier
              ? 2 // eslint-disable-line prettier/prettier
              : 1; // eslint-disable-line prettier/prettier
    }
  }
};

// fills spaces with reserved cells based on options
const preFillMatrix = (matrix: Matrix, reservedSpace?: Dimensions[]) => {
  if (!reservedSpace) return;
  reservedSpace.forEach((space) =>
    fillMatrix(matrix, space, 0, 0, false, true)
  );
};

export const logMatrix = (matrix: Matrix) => {
  const flippedMatrix = flipMatrix(matrix);
  const start =
    'y\\x | ' +
    matrix.map((_, i) => (i > 9 ? '' : ' ') + i + ' ').join(' | ') +
    '\n' +
    Array(matrix.length + 1)
      .fill('---')
      .join('---') +
    '\n';
  const string = flippedMatrix
    .map(
      (line, row) =>
        ' ' +
        row +
        (row > 9 ? '' : ' ') +
        ' | ' +
        line
          .map((cell) => {
            switch (cell) {
              case 1:
                return ' ■ ';
              case 2:
                return '[▣]';
              case 3:
                return ' · ';
              case 4:
                return ' X ';
              default:
                return '   ';
            }
          })
          .join(' | ')
    )
    .join(
      '\n' +
        Array(matrix.length + 1)
          .fill('---')
          .join('---') +
        '\n'
    );
  console.log('\n\n' + start + string + '\n\n');
};

const flipMatrix = (matrix: Matrix): Matrix =>
  matrix[0].map((val, index) => matrix.map((row) => row[index]));

const trimMatrix = (matrix: Matrix, axis: Axis) => {
  const m = axis === 'y' ? matrix : flipMatrix(matrix);
  // reverse matrix to start from the end and find first column with filled cells
  let endIndex = m.length - 1;
  for (let x = endIndex; x > 0; x--) {
    const columnContainsElements = m[x].some((el) => el === 1 || el === 2);
    if (columnContainsElements) {
      break;
    }
    endIndex--;
  }
  switch (axis) {
    case 'y':
      matrix.splice(endIndex);
      break;
    case 'x':
      for (let i = 0; i < matrix.length; i++) {
        matrix[i].splice(endIndex + 1);
      }
      break;
  }
};

interface InputGridItem extends Partial<GridItem> {
  id: identifier;
}

const getFixedPositionWeight = (pos: Nullish<Vector2>) =>
  Object.values(pos).reduce(
    (acc, p) => (p !== undefined ? (acc ?? 0) + 1 : acc),
    0
  ) ?? 0;

export interface GridLayoutData {
  items: GridItemWithPosition[];
  matrix: Matrix;
  matrixSize: Size;
  layoutDimensions: CssSize;
}

export const generateGridLayout = (
  items: InputGridItem[],
  opts: Partial<typeof defaultGridOptions>
): GridLayoutData => {
  const { rows, columns, marginX, marginY, axis, reservedSpace } =
    Object.assign({}, defaultGridOptions, opts);

  // set default size if unset, sort based on pinned position.
  // first 2 pinned positions, then 1 pinned position, then 0
  const orderedItems: GridItemWithPosition[] = [];
  const gridItems = items
    .map((item) => ({
      ...item,
      width: item.width ?? defaultGridItemSize.width,
      height: item.height ?? defaultGridItemSize.height,
    }))
    .sort((a, b) => {
      const aWeight = getFixedPositionWeight(a);
      const bWeight = getFixedPositionWeight(b);
      return bWeight - aWeight;
    });

  let matrixSize = getMatrixMaxSize(
    gridItems,
    axis,
    rows,
    columns,
    marginX,
    marginY,
    reservedSpace
  );

  const matrix: Matrix = Array.from({ length: matrixSize.width }, () =>
    new Array(matrixSize.height).fill(0)
  );

  preFillMatrix(matrix, reservedSpace);
  for (const item of gridItems) {
    const isPinned = item.x !== undefined || item.y !== undefined;
    // push item as is if it already contains x and y position
    const itemPosition = findItemPosition(
      matrix,
      {
        width: item.width,
        height: item.height,
      },
      item.x ?? 0,
      item.y ?? 0,
      marginX,
      marginY,
      axis,
      item.x,
      item.y
    );
    if (itemPosition) {
      const orderedItem = {
        width: item.width,
        height: item.height,
        ...itemPosition,
        pinnedX: item.x,
        pinnedY: item.y,
        id: item.id,
        isPinned,
        extraData: item.extraData,
      };

      fillMatrix(matrix, orderedItem, marginX, marginY, isPinned);
      orderedItems.push(orderedItem);
    }
  }
  trimMatrix(matrix, axis);
  // logMatrix(matrix);

  matrixSize = getMatrixSize(matrix);
  const layoutDimensions = getGridLayoutDimensions(matrixSize);

  return { items: orderedItems, matrix, matrixSize, layoutDimensions };
};

export const gridLength = (l: number, axis: Axis) =>
  l * (axis === 'x' ? cellWidth() : cellHeight()) +
  (l > 0 ? (l - 1) * unit() : 0);

export const gridPosition = (pos: number, axis: Axis) =>
  gridLength(pos, axis) + (pos > 0 ? unit() : 0);

export interface Dimensions extends Vector2, Size {}

export interface CssSize {
  width: string;
  height: string;
}

export interface CssDimensions extends CssSize {
  x: string;
  y: string;
}

export interface ItemDimensions extends Dimensions {
  css: CssDimensions;
}

export const getItemDimensions = (
  item: GridItemWithPosition
): ItemDimensions => {
  const width = gridLength(item.width, 'x');
  const height = gridLength(item.height, 'y');
  const x = gridPosition(item.x, 'x');
  const y = gridPosition(item.y, 'y');
  const css = {
    width: cssCellWidth(item.width),
    height: cssCellHeight(item.height),
    x: cssCellWidth(item.x, true),
    y: cssCellHeight(item.y, true),
  };
  return { x, y, width, height, css };
};

export const formatItemStyle = (dimensions: ItemDimensions) => ({
  width: dimensions.css.width,
  height: dimensions.css.height,
  transform: `translate(${dimensions.css.x}, ${dimensions.css.y})`,
});

export const getMatrixMaxSize = (
  sizes: Size[],
  axis: Axis,
  rows: number,
  columns: number,
  marginX: number,
  marginY: number,
  reservedSpace: Dimensions[] = []
): Size => {
  const maximums = [...sizes, ...reservedSpace].reduce(
    (acc, size) => ({
      width: acc.width + size.width + marginX,
      height: acc.height + size.height + marginY,
    }),
    {
      height: marginY,
      width: marginX,
    }
  );
  return {
    height: axis === 'y' ? rows : maximums.height,
    width: axis === 'x' ? columns : maximums.width,
  };
};

export const getMatrixSize = (matrix: Matrix): Size => {
  return {
    width: matrix.length,
    height: matrix[0].length,
  };
};

export const getGridLayoutDimensions = (size: Size): CssSize => {
  return {
    width: cssCellWidth(size.width),
    height: cssCellHeight(size.height),
  };
};

export const screenToGrid = (delta: Vector2) => {
  return {
    x: Math.round(delta.x / cellWidth()),
    y: Math.round(delta.y / cellHeight()),
  };
};

export const normalizeGridItems = (
  items: Partial<GridItem>[]
): (Partial<GridItem> & { id: identifier })[] =>
  items.map((item, index) => ({
    ...item,
    id: item.id ?? 'grid__item__' + index,
  }));

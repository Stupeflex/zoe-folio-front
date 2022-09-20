import { Vector2 } from '@/utils/gestures';

export interface Size {
  width: number;
  height: number;
}

export interface GridItem extends Vector2, Size {}

export interface GridProps {
  items: Partial<GridItem>[];
  rows?: number;
  columns?: number;
  gap?: number;
  marginX?: number;
  marginY?: number;
}

export interface ItemPosition extends Vector2 {
  targetX: number;
  targetY: number;
}

export interface GridItemWithPosition extends GridItem, ItemPosition {}

export const defaultGridOptions = {
  rows: 12,
  columns: 19,
  gap: 12,
  marginX: 0,
  marginY: 0,
};

export const defaultGridItemSize: Size = {
  width: 5,
  height: 3,
};

type Matrix = (0 | 1)[][];

const fitLengthInLine = (
  line: Matrix[number],
  length: number,
  start = 0
): number | undefined => {
  let countStart = start;
  let count = 0;
  for (let i = start; i < line.length; i++) {
    const cell = line[i];
    const isFreeCell = cell === 0;
    if (isFreeCell) {
      count++;
    } else {
      countStart = i;
      count = 0;
    }
    if (count === length) return countStart;
  }
  return undefined;
};

const findItemPosition = (
  matrix: Matrix,
  item: Size,
  startX = 0,
  startY = 0
) => {
  let countStart = startX;
  let xCount = 0;
  for (let x = startX; x < matrix.length; x++) {
    const possibleRowStart = fitLengthInLine(matrix[x], item.height, startY);
    if (possibleRowStart !== undefined) {
      startY = possibleRowStart;
      xCount++;
    } else {
      countStart = x;
      xCount = 0;
      startY = 0;
    }
    if (xCount === item.width) return { x: countStart, y: startY };
  }
  return undefined;
};

const fillMatrix = (matrix: Matrix, item: GridItemWithPosition) => {
  for (let x = item.x; x < item.x + item.width; x++) {
    for (let y = item.y; y < item.y + item.height; y++) {
      matrix[x][y] = 1;
    }
  }
};

export const orderItems = (
  items: GridProps['items'],
  opts: Partial<typeof defaultGridOptions>
) => {
  const { rows, columns } = Object.assign(defaultGridOptions, opts);

  const orderedItems: GridItemWithPosition[] = [];
  const matrix: Matrix = Array(columns).fill(Array(rows).fill(0));

  for (const item of items) {
    const width = item.width ?? defaultGridItemSize.width;
    const height = item.height ?? defaultGridItemSize.height;
    // push item as is if it already contains x and y position
    const itemPosition = findItemPosition(matrix, { width, height });
    if (itemPosition) {
      const x = item.x ?? itemPosition.x;
      const y = item.y ?? itemPosition.y;
      const orderedItem = {
        width,
        height,
        x,
        y,
        targetX: x,
        targetY: y,
      };

      fillMatrix(matrix, orderedItem);
      orderedItems.push(orderedItem);
    }
  }

  return orderedItems;
};

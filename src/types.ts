export type Title = {
  show: boolean;
  text?: string;
};

export type Board = number[][];

export type ResultItem = {
  name: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  id?: string;
  width?: number;
  height?: number;
  color?: string;
};

export type Result = ResultItem[];

export type Matrix<T> = T[][];

export enum ShapeCharEnum {
  empty = "-",
  smallSq = "S",
  bigSq = "B",
  horizRect = "H",
  vertRect = "V"
}

export type ShapeName = "smallSq" | "bigSq" | "horizRect" | "vertRect";

export type ShapeMatricesList = {
  [key in ShapeName]: Matrix<string>;
};

import { useEffect, useState } from "react";
import {
  collageDimensions,
  shapeDimension,
  quantities,
  assets
} from "./consts";
import {
  Board,
  Matrix,
  Result,
  ShapeCharEnum,
  ShapeDimensionsList,
  ShapeMatricesList
} from "./types";

export const useBuildCollage = () => {
  const [state, setState] = useState<Result>([]);

  let board: Board = [];

  const result: Result = [];

  let wellList = [];

  const createMatrix = <T extends string | boolean = string>(
    rows: number,
    cols: number,
    val: T
  ): Matrix<T> => {
    // Initialize an empty matrix
    const matrix: Matrix<T> = [];

    // Loop through the rows and create a new columns array for each row, put the specified value in each cell
    for (let i = 0; i < rows; i++) {
      const row: T[] = [];

      for (let j = 0; j < cols; j++) {
        row.push(val);
      }
      matrix.push(row);
    }

    return matrix;
  };

  const createShapeMatrix = (
    shapeDimensionsList: ShapeDimensionsList
  ): ShapeMatricesList => {
    // Create matrix for every shape, using the defined dimensions

    const shapeMatricesList = {} as ShapeMatricesList;

    for (const shapeName in shapeDimensionsList) {
      const { width, height } = shapeDimensionsList[shapeName];

      const matrix: Matrix<string> = createMatrix(
        height,
        width,
        ShapeCharEnum[shapeName]
      );

      shapeMatricesList[shapeName] = matrix;
    }

    // Return the completed shape matrix object
    return shapeMatricesList;
  };

  const visited: Matrix<boolean> = createMatrix(
    collageDimensions.height,
    collageDimensions.width,
    false
  );
  console.log("visited=", visited, visited[0][1]);

  function assignNames(assets) {
    const widths = assets.map((asset) => asset.width);
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);

    assets.forEach((asset) => {
      if (asset.width < asset.height) {
        asset.name = "vertRect";
      } else if (asset.width > asset.height) {
        asset.name = "horizRect";
      } else if (
        asset.width === asset.height &&
        asset.width >= (maxWidth + minWidth) / 2
      ) {
        asset.name = "bigSq";
      } else if (
        asset.width === asset.height &&
        asset.width < (maxWidth + minWidth) / 2
      ) {
        asset.name = "smallSq";
      }
    });
  }

  function addAssetsToResults() {
    const mergedAssets = new Set();

    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < result.length; j++) {
        if (
          assets[i].name === result[j].name &&
          !result[j].hasOwnProperty("id") &&
          !mergedAssets.has(assets[i].id)
        ) {
          result[j] = { ...result[j], ...assets[i] };
          mergedAssets.add(assets[i].id);
        }
      }
    }
    console.log("mergedAssets=", mergedAssets);
  }

  function print(board) {
    for (let row = 0; row < board.length; row++) {
      let rowString = "";
      for (let col = 0; col < board[0].length; col++) {
        rowString += board[row][col] + " ";
      }
      console.log(rowString);
    }
  }

  function shuffleArray(shapeList) {
    for (let i = shapeList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shapeList[i], shapeList[j]] = [shapeList[j], shapeList[i]];
    }
    return shapeList;
  }

  function isValidPlacement(shape, r, c) {
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;
    if (
      r + shapeRows > collageDimensions.height ||
      c + shapeCols > collageDimensions.width
    ) {
      return false;
    }
    for (let i = 0; i < shapeRows; i++) {
      for (let j = 0; j < shapeCols; j++) {
        if (shape[i][j] !== 0 && board[r + i][c + j] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  function placeShape(shape, r, c) {
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;
    for (let i = 0; i < shapeRows; i++) {
      for (let j = 0; j < shapeCols; j++) {
        if (shape[i][j] !== 0) {
          board[r + i][c + j] = shape[i][j];
        }
      }
    }
  }

  function removeShape(shape, r, c) {
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;
    for (let i = 0; i < shapeRows; i++) {
      for (let j = 0; j < shapeCols; j++) {
        if (shape[i][j] !== 0) {
          board[r + i][c + j] = 0;
        }
      }
    }
  }

  function backtrack(index) {
    if (index === wellList.length) {
      return true;
    }
    for (let r = 0; r < collageDimensions.height; r++) {
      for (let c = 0; c < collageDimensions.width; c++) {
        console.log("=", visited[r][c]);
        if (visited[r][c]) {
          continue;
        }
        const well = wellList[index];
        if (isValidPlacement(well.matrix, r, c)) {
          placeShape(well.matrix, r, c);

          visited[r][c] = true;

          if (backtrack(index + 1)) {
            const rowStart = r + 1;
            const rowEnd = r + well.matrix.length + 1;
            const colStart = c + 1;
            const colEnd = c + well.matrix[0].length + 1;

            result.push({
              name: well.name,
              rowStart: rowStart,
              rowEnd: rowEnd,
              colStart: colStart,
              colEnd: colEnd
            });

            return true;
          } else {
            visited[r][c] = false;
            removeShape(well.matrix, r, c);
          }
        }
      }
    }
    return false;
  }

  function fillBoard(board, quantities, shapeMatrix) {
    for (const shape in quantities) {
      for (let i = 0; i < quantities[shape]; i++) {
        wellList.push({ name: shape, matrix: shapeMatrix[shape] });
      }
    }

    wellList = shuffleArray(wellList);

    if (backtrack(0)) {
      print(board);
    } else {
      console.log("No solution found.");
    }
  }

  function validateAssets() {
    const count = {};

    // Loop through each asset in the assets array
    for (const asset of assets) {
      // Check if the asset has a name property and if it's in the quantities object
      if (asset.name && quantities[asset.name]) {
        // Increment the count of the asset's name in the count object
        count[asset.name] = (count[asset.name] || 0) + 1;
      }
    }

    // Loop through each name in the quantities object and check if there are at least shapes as defined.
    for (const name in quantities) {
      if (quantities[name] < count[name]) {
        return false;
      }
    }

    return true;
  }

  // ============================ effect ============================

  useEffect(() => {
    board = createMatrix(collageDimensions.height, collageDimensions.width, 0);

    const shapeMatrix = createShapeMatrix(shapeDimension);

    assignNames(assets);
    console.log("assets=", assets);
    const isValid = validateAssets();
    console.log("isValid=", isValid);

    if (isValid) {
      fillBoard(board, quantities, shapeMatrix);
      addAssetsToResults();
      console.log("result=", result);
    }

    console.log("====");

    setState(result);
  }, []);

  return state;
};

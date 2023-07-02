import GridItem from "./GridItem";
import { collageDimensions } from "./consts";

import "./styles.css";
import { useBuildCollage } from "./useBuildCollage";

export default function App() {
  const state = useBuildCollage();
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <div
        className="grid-container"
        style={{
          gridTemplateRows: `repeat(${collageDimensions.height}, 1fr)`,
          gridTemplateColumns: `repeat(${collageDimensions.width}, 1fr)`
        }}
      >
        <>
          {state &&
            state.map((item, key) => (
              <GridItem
                key={key}
                colStart={item.colStart}
                colEnd={item.colEnd}
                rowStart={item.rowStart}
                rowEnd={item.rowEnd}
                color={item.color}
                id={item.id}
              />
            ))}
        </>
      </div>
    </div>
  );
}

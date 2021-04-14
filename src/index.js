import React from "./mini-react/react";
import ReactDOM from "./mini-react/react-dom";

const div = (
  <div
    id="box"
    style={{
      width: "200px",
      border: "1px solid #000",
    }}
  >
    <h1>hello react</h1>
    <ul className="list">
      <li>React-1</li>
      <li>React-2</li>
    </ul>
    <button
      onClick={() => {
        alert(1);
      }}
    >
      按钮
    </button>
  </div>
);
console.log(div);

ReactDOM.render(div, document.querySelector("#root"));


import React from "./mini-react/react";
import ReactDOM from "./mini-react/react-dom";

class App extends React.Component {
  state={count:1}
  render(){
    console.log(this);
    return <div>
      {this.state.count}
      <button onClick={()=>{
        this.setState({
          count:this.state.count+1
        })
      }}>按钮</button>
    </div>
  }
}

// const div = (
//   <div
//     id="box"
//     style={{
//       width: "200px",
//       border: "1px solid #000",
//     }}
//   >
//     <h1>hello react</h1>
//     <ul className="list">
//       <li>React-1</li>
//       <li>React-2</li>
//     </ul>
//     <button
//       onClick={() => {
//         alert(1);
//       }}
//     >
//       按钮
//     </button>
//   </div>
// );
// console.log(div);

ReactDOM.render(
  <App/>, 
  document.querySelector("#root")
);

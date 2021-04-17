
import React from "./mini-react/react";
import ReactDOM from "./mini-react/react-dom";

class Count extends React.Component {
  state = {count:1}
  render(){
    return <div>
        <p>{this.state.count}</p>
        <button id="btn" onClick={()=>{
            this.setState({
              count: this.state.count+1
            })
        }}>按钮</button>
    </div>
  }
}
class Li extends React.Component {
  render(){
    const {data,remove} = this.props;
    const {id,title} = data;
    return <li>{title} --- <button onClick={()=>{
      remove(id);
    }}>删除</button></li>
  }
}
class Todo extends React.Component {
  render(){
    const {index,todo,addTodo,remove} = this.props;
    return <div 
      className={"todo-"+index}
      style={{
        width: 200 + (index*20) + "px",
        border: "2px solid #000"
      }}
    >
      <h2>todo - <button onClick={addTodo}>添加</button></h2>
      {todo.map(item=>{
          return <Li data={item} key={item.id} remove={remove} />
      })}  
    </div>
  }
}
class App extends React.Component {
  state = {
    index: 1,
    data:[
      {
        id: 0,
        title: "这是todo-0"
      },{
        id: 1,
        title: "这是todo-1"
      }
    ]
  }
  addTodo=()=>{
    const {index,data} = this.state;
    this.setState({
      index: index + 1,
      data: [...data,{
        id: index + 1,
        title: "这是todo-"+(index+1)
      }]
    })
  }
  remove=(id)=>{
    const {data} = this.state;
    this.setState({
      data: data.filter(item=>item.id!==id)
    })
  }
  render(){
    const {index,data} = this.state;
    return <div>
        <Count />
        <hr />
        <Todo 
          addTodo = {this.addTodo}
          index={index}
          todo={data}
          remove = {this.remove}
        />       
    </div>
  }
}

ReactDOM.render(
  <App/>, 
  document.querySelector("#root")
);

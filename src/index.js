import React from './mini-react/react'


const div = <div id="box">
<h1>hello react</h1>
<ul className="list">
  <li>React-1</li>
  <li>React-2</li>  
</ul>
<button onClick={()=>{
  alert(1)
}}>按钮</button>
</div>

console.log(div);

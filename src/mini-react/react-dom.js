import { elementType, textType } from "./react";
function render(vDom, container, cb) {
  const node = createNode(vDom);

  container.appendChild(node);

  cb && cb();
}
//根据虚拟DOM 构建真实DOM
function createNode(vDom) {
  let node;
  if (vDom.$$typeof === textType) {
    node = document.createTextNode(vDom.content);
  } else if (vDom.$$typeof === elementType) {
    if (typeof vDom.type === "string") {
      // 元素
      node = document.createElement(vDom.type);
      createProps(node, vDom.props);
      // 判断元素是否有子节点，然后递归
      createChild(node, vDom.children);
    } else if(vDom.type.isReactComponent){
      // 类组件
      node = createClass(vDom)
    }
  }

  return node;
}

// 创建子节点
function createChild(node, children) {
  if (!Array.isArray(children)) {
    return;
  }
  children.forEach((item) => {
    render(item, node);
  });
}

/* 生命周期函数 */

function stateFromProps(Cmp,props){
  if(Cmp.getDerivedStateFromProps){
    return Cmp.getDerivedStateFromProps(props);
  }
  return {}
}

function didMount(cmp){
  if(cmp.componentDidMount){
    setTimeout(()=>{
      batchUpdate(cmp,cmp.componentDidMount);
    })
  }
}

/*
  setState 本质上是同步方法。
  但是 setState表现上是同步还是异步方法取决于是否触发了React的批更新机制，如果触发，那么会收集一个操作内所有的setState，然后一起进行更新
  过程中只会updater一次。如果没有触发批更新机制，那么调用一次 setState 就会 updater 一次。

  批更新机制：在更新之前，会先把批更新的开关打开，如果开关是打开的，那么去收集setState，也就是push进数组，然后执行该操作。然后关闭开关。执行队列中的setState
  依次进行更新。 如果开关没有打开，会直接进行updater。
  哪些操作会触发：生命周期,合成函数，hooks里面的方法
 */

function batchUpdate(cmp,fn,...payload){
  cmp.isBatchUpdate = true;
  cmp.nextStates = [];
  fn.apply(cmp,payload)
  cmp.isBatchUpdate = false;
  if(cmp.nextStates.length>0){
    let nextState={};
    cmp.nextStates.forEach(item=>{
      Object.assign(nextState,item)
    });
    cmp.nextStates.length=0;
    cmp.updater(cmp.props,Object.assign({},cmp.state,nextState));
  }
}

// 初始化类组件
function createClass(Cmp){
  let cmp = new Cmp.type(Cmp.props);
  let nextState = stateFromProps(Cmp,Cmp.props);
  if(cmp.state){
    Object.assign(cmp.state,nextState);
  }
  let vDom = cmp.render();
  let node = createNode(vDom);
  didMount(cmp);
  cmp.updater = function(nextProps,nextState){
    console.log("updater",nextState);
  };
  return node;
}

// 创建属性
function createProps(node, props) {
  for (let s in props) {
    if (typeof props[s] === "object") {
      createProps(node[s], props[s]);
    } else if (s.slice(0, 2) === "on") {
      // React 中，有自己的一套事件合成机制
      node[s.toLowerCase()] = props[s];
      // node[s.toLowerCase()]=(e)=>{
      //   batchUpdate(cmp,props[s],event,"");
      // }
    } else {
      node[s] = props[s];
    }
  }
}

const ReactDOM = {
  render,
};

export default ReactDOM;

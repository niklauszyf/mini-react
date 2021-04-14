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
      cmp.componentDidMount();
    })
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
    } else {
      node[s] = props[s];
    }
  }
}

const ReactDOM = {
  render,
};

export default ReactDOM;

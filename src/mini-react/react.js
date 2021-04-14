const elementType = Symbol("react.element");
const textType = Symbol("react.text");

function createElement(type,props,...child){
  // console.log(type,props,children);
  delete props.__self;
  delete props.__source;
  
  let children = child.flat(Infinity)
  children=children.map(item=>{
    if(typeof item==="object"){
      return item
    }
    return {
      $$typeof:textType,
      content:(typeof item==="string" || typeof item==="number")?item:""
    }
  })
  return {
    $$typeof:elementType,
    type,
    props,
    children
  }

}

class Component{
  constructor(props){
    this.props=props;
    this.state=null;
  }
  static isReactComponent={};
  // 如果nextState是函数，要执行拿到返回结果。如果是对象，则直接进行后续操作
  setState(nextState){
    if(this.isBatchUpdate){
      this.nextStates.push(nextState)
    } else {
      this.updater(this.props,Object.assign({},this.state,nextState))
    }
  }
}

const React={
  createElement,
  Component
}

export {createElement, elementType, textType, Component}

export default React;
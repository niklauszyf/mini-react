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

const React={
  createElement
}

export {createElement, elementType, textType}

export default React;
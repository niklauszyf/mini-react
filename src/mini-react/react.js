const elementType = Symbol("react.element");

function createElement(type,props,...children){
  // console.log(type,props,children);
  delete props.__self
  delete props.__source
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

export {createElement, elementType}

export default React;
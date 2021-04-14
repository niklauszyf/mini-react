import { elementType, textType } from "./react";
function render(vDom, container, cb) {
  const node = createNode(vDom);

  container.appendChild(node);

  cb&&cb();
}
//根据虚拟DOM 构建真实DOM
function createNode(vDom) {
  let node;
  if (vDom.$$typeof === textType) {
    node = document.createTextNode(vDom.content);
  } else if (vDom.$$typeof === elementType) {
    // 元素
    node = document.createElement(vDom.type);
    createProps(node, vDom.props);
    // 判断元素是否有子节点，然后递归
    createChild(node, vDom.children);
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

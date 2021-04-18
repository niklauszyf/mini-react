import { elementType, textType } from "./react";
import patch from "./patch";
/**
 * 节点会产生6种更新：
 * 1.replace 节点被替换
 *    -- parentNode.replaceChild(newNode,currentNode)
 *    --  {
 *          type:"replace",
 *          parentNode,
 *          newNode,
 *          currentNode
 *        }
 * 2.remove 节点被删除
 *    -- node.remove()
 *    -- {
 *        type:"remove",
 *        node,
 *        }
 * 3.move 位置有变化
 *    -- parentNode.insertBefore(Node,referenceNode)
 *    -- {
 *        type:"move",
 *        parentNode,
 *        Node,
 *        referenceNode
 *        }
 * 4.insert 需要插入新节点
 *    -- -- parentNode.insertBefore(newNode,referenceNode)
 *    -- {
 *        type:"insert",
 *        parentNode,
 *        newNode,
 *        referenceNode
 *        }
 * 5.text 文本节点有更新
 *     -- node.textContent = newContent;
 *     --{
 *         type:"text",
 *         node,
 *         newContent
 *        }
 * 6.props 属性值有变化
 *    -- node[s]=props[s]
 *    -- {
 *        type:"props",
 *        node,
 *        props
 *        }
 */

/**
 * 1.tree diff   --- 同层对比，递归向下
 * 2.node diff   ---
 *    a.type是否发生变化
 *    b.文本节点内容是否有更新
 *    c.组件：更新该组件
 *    d.元素：对比属性，递归children去对比子节点
 * 3.list(child) diff  ---
 *   1.查找新增项和删除项
 *    a.基于key转成对象
 *    b.循环next，找出prev中没有的新增项，找出调用node diff 对比，节点是否有变化
 *    c.循环prev，找出next中没有的删除项
 *   2.对比位置是否产生变化
 *    a.使用元素更新前的索引，套用索引规则（后一项不应该小于前一项）
 *    b.不符合规则的代表位置发生了变化
 *
 */

/*test*/

function diff(oldTree, newTree, createNode) {
  // console.log(oldTree,newTree);
  return diffNode(oldTree, newTree, createNode);
}

/**
 * tree diff:虚拟DOM树的diff策略
 * React在对比 新旧DOM，采取的是同层对比的策略，如果节点有跨层移动（跨父级移动）的情况下，React不考虑这个问题，
 * 会先从当前位置删掉该节点，在新位置创建该节点
 */

/**
 * 1.type 是否发生变化
 * 2.文本节点的内容有更新
 * 3.组件：更新该组件
 * 4.元素：对比属性，递归children去对比子节点
 */

function diffNode(oldNode, newNode, createNode) {
  let patchs = [];
  // console.log(oldNode);
  let node = oldNode._DOM;
  let parent = node.parentNode;
  let newVDOM = oldNode;
  if (oldNode.type !== newNode.type) {
    // replace 节点替换
    patchs.push({
      type: "replace",
      parent,
      newNode: createNode(newNode),
      node,
    });
    newVDOM=newNode;
  } else if (oldNode.$$typeof === textType) {
    if (oldNode.content !== newNode.content) {
      // console.log("文本节点的内容有更新");
      patchs.push({
        type: "text",
        node,
        newContent: newNode.content,
      });
      newVDOM.content=newNode.content;
    }
  } else if (oldNode.$$typeof === elementType) {
    if (typeof oldNode.type === "string") {
      // 元素节点
      /**
       * 对比属性是否发生变化
       * 递归下一层
       */
      let propsPatchs = diffProps(oldNode.props, newNode.props);
      if (Object.keys(propsPatchs).length > 0) {
        patchs.push({
          type: "props",
          node,
          propsPatchs,
        });
        newVDOM.props=newNode.props;
      }
      // 递归子节点
      newVDOM.children=diffChild(oldNode.children, newNode.children, createNode, node);
    } else {
      // 组件
      // 如果是组件，则更新该组件
      updaterComponent(oldNode, newNode);
    }
  }
  if(patchs.length>0){
    patch(patchs)
  };
  return newVDOM;
}

function diffProps(oldProps, newProps) {
  let propsPatchs = {};
  for (let s in newProps) {
    if (oldProps[s] !== undefined) {
      if (typeof newProps[s] === "object") {
        let subPatchs = diffProps(oldProps[s], newProps[s]);
        if (Object.keys(subPatchs).length > 0) {
          propsPatchs[s] = subPatchs;
        }
      } else if (oldProps[s] !== newProps[s]) {
        // console.log(s,"替换");
        propsPatchs[s] = newProps[s];
      }
    } else {
      // console.log(s,"新增");
      propsPatchs[s] = newProps[s];
    }
  }
  for (let s in oldProps) {
    if (newProps[s] === undefined) {
      // console.log(s,"删除");
      propsPatchs[s] = null;
    }
  }
  return propsPatchs;
}

function updaterComponent(oldCmp, newCmp) {
  // console.log(oldCmp,newCmp);
  oldCmp.props=newCmp.props;
  oldCmp._cmp.updater(newCmp.props, oldCmp._cmp.state);
  return oldCmp;
}

function setKeys(child) {
  let keys = {};
  child.forEach((item, index) => {
    let { key = index } = item;
    key = "k-" + key;
    keys[key] = item;
    keys[key].index = index;
  });
  return keys;
}

function diffChild(oldChild, newChild, createNode, parentNode) {
  // diffNode(oldNode,newNode)
  let patchs = [];
  let oldKeys = setKeys(oldChild);
  let newKeys = setKeys(newChild);
  let newChildren = newChild;
  let lastIndex = 0;
  for (let k in newKeys) {
    let index = newKeys[k].index;
    if (oldKeys[k] !== undefined) {
      
      newChildren[index]=diffNode(oldKeys[k], newKeys[k], createNode);
      if (lastIndex > oldKeys[k].index) {
        // console.log(newKeys[k],"顺序有变化");
        let prevIndex = index - 1;
        let prev=prevIndex < 0 ? parentNode.children[0] : newChildren[prevIndex]._DOM;
        let after = prev ? prev.nextElementSibling : null;
        patchs.push({
          type: "move",
          parentNode,
          node: oldKeys[k]._DOM,
          after,
        });
      } else {
        lastIndex = oldKeys[k].index;
      }
    } else {
      // console.log(newKeys[k],"新增项");
      let prevIndex = newKeys[k].index - 1;
      let prev=prevIndex < 0 ? parentNode.children[0] : newChildren[prevIndex]._DOM;
      let after = prev ? prev.nextElementSibling : null;
      patchs.push({
        type: "insert",
        parentNode,
        newNode:createNode(newKeys[k]),
        after,
      });
    }
  }
  for (let k in oldKeys) {
    // console.log(oldKeys[k]);
    if (newKeys[k] === undefined) {
      // console.log(oldKeys[k],"删除项");
      patchs.push({
        type: "remove",
        node: oldKeys[k]._DOM,
      });
    }
  }
  if(patchs.length>0){
    patch(patchs);
  }
  return newChildren;
}

export default diff;

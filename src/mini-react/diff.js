import { elementType, textType } from "./react";

/**
 * 节点会产生6种更新：
 * 1.replace 节点被替换
 * 2.remove 节点被删除
 * 3.move 位置有变化
 * 4.insert 需要插入新节点
 * 5.text 文本节点有更新
 * 6.props 属性值有变化
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

function diff(oldTree,newTree){
  // console.log(oldTree,newTree);
  diffNode(oldTree,newTree)
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

function diffNode(oldNode,newNode){
  if(oldNode.type!==newNode.type){
    console.log("替换");
  }else if(oldNode.$$typeof === textType){
    if(oldNode.content!==newNode.content){
      console.log("文本节点的内容有更新");
    }
  }else if(oldNode.$$typeof===elementType){
    if(typeof oldNode.type==="string"){
      // 元素节点
      /**
       * 对比属性是否发生变化
       * 递归下一层
       */
      diffProps(oldNode.props,newNode.props)
      diffChild(oldNode.children,newNode.children)
    }else {
      // 组件
      // 如果是组件，则更新该组件
      updaterComponent(oldNode,newNode)
    }
  }
}

function diffProps(oldProps,newProps){
  for(let s in newProps){
    if(oldProps[s]!==undefined){
      if(typeof newProps[s]==="object"){
        diffProps(oldProps[s],newProps[s])
      }else if(oldProps[s]!==newProps[s]){
        console.log(s,"替换");
      }
    }else {
      console.log(s,"新增");
    }
  }
  for(let s in oldProps){
    if(newProps[s]===undefined){
      console.log(s,"删除");
    }
  }
}



function updaterComponent(oldCmp,newCmp){
  // console.log(oldCmp,newCmp);
  oldCmp._cmp.updater(newCmp.props,oldCmp._cmp.state)
}

function setKeys(child){
  let keys={}
  child.forEach((item,index)=>{
    let {key=index}=item;
    key="k-"+key;
    keys[key]=item;
    keys[key].index=index;
  });
  return keys;
}

function diffChild(oldChild,newChild){
  // diffNode(oldNode,newNode)
  let oldKeys = setKeys(oldChild);
  let newKeys = setKeys(newChild);
  let lastIndex = 0;
  for(let k in newKeys){
    if(oldKeys[k]!==undefined){
      diffNode(oldKeys[k],newKeys[k])
      if(lastIndex>oldKeys[k].index){
        console.log(newKeys[k],"顺序有变化");
      }else{
        lastIndex=oldKeys[k].index
      }
    }else{
      console.log(newKeys[k],"新增项");
    }
  }
  for(let k in oldKeys){
    if(newKeys[k]===undefined){
      console.log(oldKeys[k],"删除项");
    }
  }
}

export default diff;
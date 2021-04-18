function patch(patchs){
  patchs.forEach(item=>{
    switch(item.type){
      case "text":
        item.node.textContent=item.newContent;
        break;
      case "remove":
        item.node.remove();
        break;
      case "replace":
        item.parent.replaceChild(item.newNode,item.node)
        break;
      case "insert":
        item.parentNode.insertBefore(item.newNode,item.after)
        break;
      case "move":
        item.parentNode.insertBefore(item.node,item.after)
        break;
      case "props":
        setProps(item.node,item.propsPatchs)
        break;
      default:
        break;
    }
  })
}

function setProps(node,props){
  for(let s in props){
    if(props[s]===null){
      node[s]="";
    }else if(typeof props[s]==="object"){
      setProps(node[s],props[s])
    }else if(s.slice(0,2)==="on"){
      node[s.toLowerCase()]=props[s];
    }else{
      node[s]=props[s];
    }
  }
}

export default patch;

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#map").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate("
        + (width/2+50) + "," + (height/2+70) + ")");

var i = 0,
    duration = 750,
    root;


function init() {

}

function initTree(){
    var tmp;
    var n = document.init.keyword.value;
    window.sessionStorage.clear();
    tmp = new Array();
    tmp.push({name: n});
  window.sessionStorage.setItem(0,JSON.stringify(tmp[0]));
    getApi(n);

}

function reload() {
    var tmp;
    var flag = false;//入力された親ノードが存在するか
    var flag2 = true;//入力された子ノードがまだ存在しないか
    tmp = new Array();
    for(var k=0;k<sessionStorage.length;k++) {
        tmp.push(JSON.parse(window.sessionStorage.getItem(k)));
    }
    window.sessionStorage.clear();
    var n = document.js.name.value;
    var p = document.js.parent.value;
    for(var k=0;k<tmp.length;k++) {//親ノードが存在するか
        if(tmp[k].name===p){
            flag = true;
            console.log(flag);
        }
    }
    for(var k=0;k<tmp.length;k++){
        if(tmp[k].name===p){
            flag2 = false;
        }
    }
    console.log(tmp);
    if(flag && flag2){
        tmp.push({name: n, parent: p});
    }
    else if(!flag){
        alert("親ノードが存在しません");
    }
    else {
        alert("その単語はすでに存在します");
    }
    for(var k=0;k<tmp.length;k++) {
        window.sessionStorage.setItem(k,JSON.stringify(tmp[k]));
    }
    draw(tmp);
}

function nodeDelete(d) {
    var tmp;
    var queue;
    tmp = new Array();
    queue = new Array();
    for(var k=0;k<sessionStorage.length;k++) {
        tmp.push(JSON.parse(window.sessionStorage.getItem(k)));
    }
    window.sessionStorage.clear();
    for(var k = 0; k < tmp.length; k++) {
        if(tmp[k].name===d){
            if(tmp[k].parent){
                queue.push(tmp[k].name);
                tmp.splice(k,1);
            } else {
                alert("親ノードは削除できません");
            }
        }
    }
    while(queue.length != 0){
        for(var k = 0; k < tmp.length; k++){
            if(tmp[k].parent===queue[0]){
                queue.push(tmp[k].name);
                tmp.splice(k,1);
                k--;
            }
        }
        queue.shift();
    }
    for(var k = 0; k < tmp.length; k++) {
        window.sessionStorage.setItem(k,JSON.stringify(tmp[k]));
    }
    draw(tmp);
}

// declares a tree layout and assigns the size
function draw(treeData) {

    // Assigns parent, children, height, depth
    root = d3.stratify()
        .id(function(d) { return d.name; })
        .parentId(function(d) { return d.parent; })
    (treeData);
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
 //   root.children.forEach(collapse);

    collapseRec(root);
    update(root);

}

// Collapse the node and all it's children

function collapse(d) {
    if(d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
}

function collapseRec(d) {
    if(d.children){
        d.children.forEach(collapseRec);
        untiCollapse(d);
    }
}

function untiCollapse(d) {
    if(!d.children)  {
        d.children = d._children;
        d.children.forEach(untiCollapse);
        d._children = null;
    }
}

function getApi(n) {
    var url = 'http://localhost:8000/api/v1/sum?word=' + n;
    return fetch(url,{
        mode: 'cors'
    })
  .then(function(response) {
    if(response.ok) { // ステータスがokならば
      return response.json(); // レスポンスをテキストとして変換する
    } else {
      throw new Error();
    }
  })
  .then(function(json) {
        var tmp;
        var child;
        tmp = new Array();
        child = new Array();
        child = json["result"];
        console.log(json["result"]);
        for(var k=0;k<sessionStorage.length;k++) {
            tmp.push(JSON.parse(window.sessionStorage.getItem(k)));
        }
        window.sessionStorage.clear();

        for(var k=0; k<child.length;k++) {        
            tmp.push({name: child[k], parent: n});
        }
        for(var k=0;k<tmp.length;k++) {        window.sessionStorage.setItem(k,JSON.stringify(tmp[k]));
                                      }
        draw(tmp);
    })
  .catch(function(error) {console.log(error)});

}

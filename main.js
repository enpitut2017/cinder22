

var treeData = [
        {name: "りんご",   parent: ""},
        {name: "シードル", parent: "りんご"},
        {name: "青森県", parent: "りんご"},
    {name: "果実", parent: "りんご"},
    {name: "キティちゃん", parent: "りんご"},
    {name: "赤", parent: "りんご"},
    {name: "子房", parent: "果実"},
    {name: "野菜", parent: "果実"},
    {name: "キャラクター", parent: "キティちゃん"},
    {name: "血液", parent: "赤"},
    {name: "色", parent: "赤"},
    {name: "猫", parent: "キティちゃん"},
    {name: "アサヒビール", parent: "シードル"},
    {name: "果実酒", parent: "シードル"},
    {name: "日本", parent: "青森県"},
    {name: "青函隧道", parent: "青森県"},
];



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
    console.log(treeData);

    for(var k=0;k<treeData.length;k++) {
        window.sessionStorage.setItem(k,JSON.stringify(treeData[k]));
    }

    var tmp = new Array();
    console.log(JSON.parse(window.sessionStorage.getItem(0)));
    for(var k=0;k<sessionStorage.length;k++) {
        tmp.push(JSON.parse(window.sessionStorage.getItem(k)));
    }

    draw(tmp);
}

function reload() {
    var tmp;
    var flag = false;
    tmp = new Array();
    for(var k=0;k<sessionStorage.length;k++) {
        tmp.push(JSON.parse(window.sessionStorage.getItem(k)));
    }
    var n = document.js.name.value;
    var p = document.js.parent.value;
    for(var k=0;k<tmp.length;k++) {
        if(tmp[k].name===p){
            flag = true;
            console.log(flag);
        }
    }
    console.log(tmp);
    if(flag){
        tmp.push({name: n, parent: p});
    }
    else{
        alert("undefined parent node");
    }
    for(var k=0;k<tmp.length;k++) {
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


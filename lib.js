

var treemap = d3.tree()
    .size([2*Math.PI, 500])
    .separation(function(a,b){return (a.parent==b.parent?1:2)/a.depth;});

function update(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);
    
    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * 180});

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
            return "translate(" + radialPointY(source.x0,source.y0) + "," 
                + radialPointX(source.x0,source.y0) + ")";
        });

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        })
    .on('click', click);

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? 30 : 13;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) { return d.id.substring(d.id.lastIndexOf(".")+1); });//d.data.name

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(d) { 
            return "translate(" + radialPointY(d.x,d.y) + "," 
                + radialPointX(d.x,d.y) + ")";
        });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', function(d){return 40/(d.depth+1)})
        .style("fill", function(d) {
        var x = (d.depth+1)*4;
        if(x>16)
            x = 15;
        var x2 = x.toString(16);
        var ans = 
        "#"+x2+x2+x2+x2+'FF';
        return ans;
        })
        .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + radialPointY(source.x, source.y) + "," 
                + radialPointX(source.x,source.y) + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
            var o = {x: radialPointX(source.x0,source.y0), 
                y: radialPointY(source.x0,source.y0)}
            return diagonal(o, o)
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
            var o = {x: radialPointX(source.x,source.y), 
                y: radialPointY(source.x,source.y)}
            return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

        var sx = radialPointX(s.x,s.y);
        var sy = radialPointY(s.x,s.y);
        var dx = radialPointX(d.x,d.y);
        var dy = radialPointY(d.x,d.y);
        path = `M ${sy} ${sx}
        C ${(sy + dy) / 2} ${sx},
            ${(sy + dy) / 2} ${dx},
            ${dy} ${dx}`

        return path
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            console.log("d.children " + d.id.substring(d.id));
            nodeDelete(d.id);
        } else {
            console.log("not d.children " + !d.children);
            getApi(d.id); 
        }
        update(d);
    }
}


function radialPointX(x,y) {
    return 0.5*(y = +y) * Math.cos(x -= Math.PI);
}

function radialPointY(x,y) {
    return 0.5*y * Math.sin(x);
}


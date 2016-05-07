"use strict";
(function() {

    var bubblePack = d3.layout.pack()
        .sort(null); //disable sort to keep nodes in DOM traversal order
    var svg = d3.select("svg")
        
    function setChartSize() {
        bubblePack = bubblePack.size([window.innerWidth, window.innerHeight])
        svg.attr("height", window.innerHeight)
            .attr("width", window.innerWidth);
    }
    
    function update(newData) {
    
        var colourInterpolator = d3.interpolateRgb("red", "green");
    
        var nodes = svg.selectAll(".node")
            .data(bubblePack.nodes({
                children: newData
            })
            .filter(function (d) {
                //prevent drawing large circle for container object
                return !d.children;
            }));
            
        var newGroups = nodes.enter()
            .append("g")
            .attr("class", "node");
            
        newGroups.append("circle");
        newGroups.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle");
                        
        nodes.transition()
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        
        //update to latest values     
        nodes.select("circle")
            .transition()
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d) {
                return colourInterpolator(d.score);
            });
            
        nodes.select("text")
            .transition()
            .text(function (d) {
                return d.entity;
            });

    }
    
    window.onresize = setChartSize;
    setChartSize();
    
    setInterval(function() {
    
        var dummyData = [
            {
                entity: "Apple",
                value: 317,
                score: 0.8
            },
            {
                entity: "Twitter",
                value: 56,
                score: 0.5
            },
            {
            entity: "Microsoft",
            value: 172,
            score: 0.1
            },
            {
                entity: "Oracle",
                value: 3,
                score: 0.9
            },
            {
                entity: "Google",
                value: 817,
                score: 0.3
            }
        ];
    
        return function () {
            dummyData.forEach(function (elem) {
                console.log(elem);
                elem.score = Math.random();
                elem.value = Math.random()*1000;
            });
            update(dummyData);
        }()
    }, 2000);
}());
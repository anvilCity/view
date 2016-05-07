"use strict";
(function() {

    Pusher.log = function(message) {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    };

    var APP_KEY = "479c59972bf192be9acf";
    var APP_SECRET = "19889e3337268d47f4a5";

    var pusher = new Pusher(APP_KEY, {
        authTransport: 'client',
        clientAuth: {
            key: APP_KEY,
            secret: APP_SECRET,
            cluster: 'eu',
            encrypted: true,
            user_id: '0',
            user_info: {}
        }
    });

    var channel = pusher.subscribe('presence-pool');

    var bubblePack = d3.layout.pack()
        .sort(null); //disable sort to keep nodes in DOM traversal order
    var svg = d3.select("svg#chart");
        
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
    
    channel.bind('client-new_data', function(data){
        update(data);
    });
    
}());
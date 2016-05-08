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

    var colourInterpolator = d3.interpolateRgb("red", "green");
    var expanded = false;

    var channel = pusher.subscribe('entities');
    //Do not confuse with #image
    var imageTag = d3.select("image");
    
    var bubblePack = d3.layout.pack()
        .sort(null); //disable sort to keep nodes in DOM traversal order
    var svg = d3.select("svg#chart");
        
    function setChartSize() {
        bubblePack = bubblePack.size([window.innerWidth, window.innerHeight])
        svg.attr("height", window.innerHeight)
            .attr("width", window.innerWidth);
    }
    
    function setImage(key, sentiment, circle) {
        function sentimentToEmotion(sentiment) {
            var goodWords = ["good", "admirable", "commendable", "exceptional", "favourable", "nice", "satisfying"];
            var badWords = ["bad", "amiss", "awful", "crummy", "garbage", "gross", "terrible"];
            var emotion,
                i;

            if (sentiment < 0.5) {
                i = Math.floor(Math.random() * badWords.length);
                emotion = badWords[i];
            } else if (sentiment > 0.5) {
                i = Math.floor(Math.random() * goodWords.length);
                emotion = goodWords[i];
            } else {
                emotion = "";
            }
            
            return emotion;
        }
        
        var query = key;// + "+" + sentimentToEmotion(sentiment);
                
        d3.json('http://api.giphy.com/v1/gifs/search?q=' + query + '&api_key=dc6zaTOxFJmzC',
            function (data) {
                if (data.data.length != 0) {
                    imageTag.attr('xlink:href', data.data[Math.floor(Math.random() * data.data.length)].images.original.url);
                    circle.style('fill', null);
                }
            }
        );
    }
    
    function update(newData) {
        
        newData.forEach(function (e, index) {
            if (e.key === "id" || e.key === "https")
                newData.splice(index, 1);
        });
    
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
            
        newGroups.append("circle")
            .attr("fill", "url(#image)");
        newGroups.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle");
                        
        nodes.transition()
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            
        nodes.on('mouseenter', function (d) {
                expanded = true;
                var circle = d3.select(this)
                //make sure we have circle and not g
                .select("circle");
                
                circle.transition()
                .duration(1000)
                .attr("r", function (d) {
                    d.oldR = d.r;
                    return 300;
                });
                
                d3.select(this)
                    .select("text")
                    .style("visibility", "hidden");
                setImage(d.key, d.avgSentiment, circle);
            //this.parentNode.appendChild(this);
        });
        
        nodes.on('mouseover', function (d) {
            this.parentNode.appendChild(this);
        });
                    
        nodes.on('mouseleave', function (d) {
            expanded = false;
            console.log(d3.event);
            var circle = d3.select(this)
                .select("circle")
                
            circle.transition()
                .duration(1000)
                .attr("r", function (d) {
                    return d.oldR;
                })
                .style("fill", function (d) {
                return colourInterpolator((d.avgSentiment * 4) - 1.6);
            });
            
            d3.select(this)
                .select("text")
                .style("visibility", null);
                
            imageTag.attr("xlink:href", null);
        });
        
        //update to latest values     
        nodes.select("circle")
            .transition()
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d) {
                return colourInterpolator((d.avgSentiment * 4) - 1.6);
            });
            
        nodes.select("text")
            .transition()
            .text(function (d) {
                return d.key;
            });

    }
    
    window.onresize = setChartSize;
    setChartSize();
    
    channel.bind('update', function(data){
        if (!expanded) {
            update(data);
        }
    });
    
}());
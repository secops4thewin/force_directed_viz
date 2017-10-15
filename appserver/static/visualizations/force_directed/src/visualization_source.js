/*
 * Visualization source
 */
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3'
            // Add required assets to this list
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            vizUtils
        ) {
  
    // Extend from SplunkVisualizationBase
    return SplunkVisualizationBase.extend({
  
        initialize: function() {
            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.$el = $(this.el);

             // Add a css selector class
            this.$el.addClass('splunk-forcedirected-meter');
            
            // Initialization logic goes here
        },

        // Optionally implement to format data returned from search. 
        // The returned object will be passed to updateView as 'data'
        formatData: function(data) {

            // Format data 

            return data;
        },
  
        // Implement updateView to render a visualization.
        //  'data' will be the data object returned from formatData or from the search
        //  'config' will be the configuration property object
        updateView: function(data, config) {

            // Guard for empty data
            if(data.rows.length < 1){
                return;
                    }
                 // Take the first data point
            datum = data.rows;

            
            // Get color config or use a default yellow shade
            var themeColor = config[this.getPropertyNamespaceInfo().propertyNamespace + 'theme'] || 'light';

            //Adjust background depending on color theme
            var svgColour = backgroundColour(themeColor);
            
            //Adjust text fill depending on color theme
            var textFill = textColour(themeColor);
            

            // Clear the div
            this.$el.empty();

            //Specify a radius, this is used to ensure nodes do not overlap.
            var radius = 12;

            //Specify a width and height that matches the Splunk console
            var width = this.$el.width();
            var height = this.$el.height();
            
            //Append an SVG Element
           var svg = d3.select(this.el)
                    .append("svg")
                    .attr('width', width)
                     .attr('height', height);

          svg.append('rect')
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("fill","#222")

          //Create a color gradient for highlighting groups
          var color = d3.scaleOrdinal(d3.schemeCategory20);
          //Create attract forces
          var attractForce = d3.forceManyBody().strength(-300).distanceMax(200).distanceMin(60);
          //Create repel forces
          var repelForce = d3.forceManyBody().strength(-140).distanceMax(50).distanceMin(10);
          //Create a simulation force and apply the attract / repel force concentrating the nodes to the middle
          var simulation = d3.forceSimulation()
              .force("link", d3.forceLink().id(function(d) { return d.id; }))
              .force("attractForce",attractForce).force("repelForce",repelForce)
              .force("center", d3.forceCenter(width / 2, height / 2));

          // Create nodes for each unique source and target.
          var nodesByName = {};

          //Create an array that is used to highlight neighbouring links
          var linkedByIndex = {};

          //Create an empty group array to allow group assignment
          var group_list = [];

          //For each row in the data push the value of the first and second column into the group_list array.  
          datum.forEach(function(link) {
             group_list.push({name : link[0]});
            group_list.push({name : link[1]});
          });

          //Perform a group by count by each source address
          var groupCount = d3.nest()
            .key(function(d) { return d.name; })
            .rollup(function(v) { return v.length; })
            .entries(group_list);


              //For each link in links create a node and push the group id to the node.
              datum.forEach(function(link) {
              group_id = groupCount.find(o => o.key === link[0]).value;
              link.source = nodeByName(link[0], group_id);
              link.target = nodeByName(link[1], group_id);
            });


              //Push the nodesByName array into the d3 values function
              var nodes = d3.values(nodesByName);

              //Append the line elements to the svg
              var link = svg.append("g")
                  .attr("class", "links")
                .selectAll("line")
                .data(datum)
                .enter().append("line")
                //If there is a value length you can adjust the width of the stroke.  This is for future use and not currently being used.
                  .attr("stroke-width", function(d) { return Math.sqrt(d.value); });


                  //Append the node elements
              var node = svg.append("g")
                  .attr("class", "nodes")
                .selectAll(".nodes")
                .data(nodes)
                .enter().append("g")
                  .attr("class", "node")
                  //Fade all other elements when you mouseover linked elements
                  .on("mouseover", fade(.1)).on("mouseout", fade(1))
                  //When you drag any node these actions start, while the node is being dragged and when it ends
                  .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended)
                    );
                  //Append a circle element to represent the node 
                  node.append("circle")
                  //Specify a radius for the node width.  This means that the circle is 5px in radius.
              .attr("r", 5)
              .attr("fill", function(d) { return color(d.group); });

              //Append the name of the source target to the node list 
            node.append("text")
              .attr("x",10)
              .attr("y",0)                   
              .attr("dy", ".35em")
              .style("fill",textFill)
              .text(function(d) { return d.name; });
              

              //Create the title element
              node.append("title")
                  .text(function(d) { return d.name; });

                //Start the simulation on the nodes
              simulation
                  .nodes(nodes)
                  .on("tick", ticked);
              //Start the simulation on the links
              simulation.force("link")
                  .links(datum);

                //For each neighbouring links map out the connections 
                datum.forEach(function(d) {
                    linkedByIndex[d.source.index + "," + d.target.index] = 1;
                });

                //Check to see if a node is connected
                function isConnected(a, b) {
                    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
                }

                //Function to perform when the d3 force directed graph is in progress 
              function ticked() {
                link
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                   .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x));  })
                    .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(width - radius, d.y));  });
              }
              //Function to check if a node is in the list and push the name and the group
            function nodeByName(name, groupId) {
                return nodesByName[name] || (nodesByName[name] = {name : name, group : groupId});;
              } 


              //Function to perform when you start to drag a node
            function dragstarted(d) {
              if (!d3.event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;

            }

            //Function to perform when a node is being dragged.
            function dragged(d) {
              d.fx = d3.event.x;
              d.fy = d3.event.y;

            }

            //Function to perform when the drag event has ended.
            function dragended(d) {
              if (!d3.event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }

            //Function to fade out other non connected nodes when you mouse over a node.
            function fade(opacity) {
                    return function(d) {
                        node.style("stroke-opacity", function(o) {
                            thisOpacity = isConnected(d, o) ? 1 : opacity;
                            this.setAttribute('fill-opacity', thisOpacity);
                            return thisOpacity;
                        });

                        link.style("stroke-opacity", function(o) {
                            return o.source === d || o.target === d ? 1 : opacity;
                        });
                    };
                }

            function backgroundColour(bColour){
               if (bColour === 'light'){
              return "white"
            }
            else if(bColour === 'dark')
                return "#222"
            }

            function textColour(tColour){
              if (tColour === 'light'){
              return "black"
            }
            else if(tColour === 'dark')
                return "silver"
            }
        },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 1000
            });
        },

        // Override to respond to re-sizing events
        reflow: function() {}
    });
});
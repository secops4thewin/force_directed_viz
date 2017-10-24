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

            // Get Attract Force Strength
            var AttractForceStrength = config[this.getPropertyNamespaceInfo().propertyNamespace + 'AttractForceStrength'] || '-300';

            // Get Attract Force Maximum Distance
            var AttractDistanceMax = config[this.getPropertyNamespaceInfo().propertyNamespace + 'AttractDistanceMax'] || '200';

            // Get Attract Force Minimum Distance
            var AttractDistanceMin = config[this.getPropertyNamespaceInfo().propertyNamespace + 'AttractDistanceMin'] || '60';

            // Get Repel Force Strength
            var RepelForceStrength = config[this.getPropertyNamespaceInfo().propertyNamespace + 'RepelForceStrength'] || '-140';

            // Get Repel Force Maximum Distance
            var RepelDistanceMax = config[this.getPropertyNamespaceInfo().propertyNamespace + 'RepelDistanceMax'] || '50';

            // Get Repel Force Minimum Distance
            var RepelDistanceMin = config[this.getPropertyNamespaceInfo().propertyNamespace + 'RepelDistanceMin'] || '10';

            //Specify a width of the line.
            var StrokeWidth = config[this.getPropertyNamespaceInfo().propertyNamespace + 'StrokeWidth'] || '1';

            // Get Repel Force Strength
            var CollisionStrength = config[this.getPropertyNamespaceInfo().propertyNamespace + 'CollisionStrength'] || '0.7';

            // Get Repel Force Maximum Distance
            var CollisionRadius = config[this.getPropertyNamespaceInfo().propertyNamespace + 'CollisionRadius'] || '20';

            // Get Repel Force Minimum Distance
            var ForceCollision = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ForceCollision'] || '20';

            //Specify a width of the line.
            var CollisionIterations = config[this.getPropertyNamespaceInfo().propertyNamespace + 'CollisionIterations'] || '1';

             //Specify a width of the line.
            var LinkLength = config[this.getPropertyNamespaceInfo().propertyNamespace + 'LinkLength'] || '1';

            //Specify whether arrows are enabled or not.
            var Arrows = config[this.getPropertyNamespaceInfo().propertyNamespace + 'arrows'] || 'disabled';

            //Specify first color range
            var ColorRange1 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange1'] || '100';
            
            //Specify second color range
            var ColorRange2 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange2'] || '500';
            
            //Specify third color range
            var ColorRange3 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange3'] || '1000';
            
            //Specify fourth color range
            var ColorRange4 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange4'] || '10000';
            
            //Specify fifth color range
            var ColorRange5 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange5'] || '10000';

             //Specify first color range
            var ColorRange1Code = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange1Code'] || '#65a637';
            
            //Specify second color range
            var ColorRange2Code = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange2Code'] || '#6db7c6';
            
            //Specify third color range
            var ColorRange3Code = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange3Code'] || '#f7bc38';
            
            //Specify fourth color range
            var ColorRange4Code = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange4Code'] || '#f58f39';
            
            //Specify fifth color range
            var ColorRange5Code = config[this.getPropertyNamespaceInfo().propertyNamespace + 'ColorRange5Code'] || '#d93f3c';
            
            //Enable Line Coloring range
            var LineColor = config[this.getPropertyNamespaceInfo().propertyNamespace + 'LineColor'] || 'disabled';

            //Adjust background depending on color theme
            var svgColour = backgroundColour(themeColor);
            
            //Adjust text fill depending on color theme
            var stringFill = stringColour(themeColor);
            
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
              .attr("fill",svgColour)

          // build the arrow.
          svg.append("svg:defs").selectAll("marker")
            .data(["end"])
            .enter().append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 30)
            .attr("refY", 0)
            .attr("fill",stringFill)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

          //Create a color gradient for highlighting groups
          var color = d3.scaleOrdinal(d3.schemeCategory20);
          //Create attract forces
          var attractForce = d3.forceManyBody().strength(AttractForceStrength).distanceMax(AttractDistanceMax).distanceMin(AttractDistanceMin);
          //Create repel forces
          var repelForce = d3.forceManyBody().strength(RepelForceStrength).distanceMax(RepelDistanceMax).distanceMin(RepelDistanceMin);
          //Create a simulation force and apply the attract / repel force concentrating the nodes to the middle
          var simulation = d3.forceSimulation()
              .force("link", d3.forceLink().id(function(d) { return d.id; }))
              .force("attractForce",attractForce).force("repelForce",repelForce)
              .force("center", d3.forceCenter(width / 2, height / 2))
              .force('collision', d3.forceCollide(ForceCollision).radius(CollisionRadius).strength(CollisionStrength).iterations(CollisionIterations));

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
               var groupFilter = groupCount.filter(function(x){
                return x.key === link[0];
                            });
               group_id = groupFilter[0].value;
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
                //If there is a value in StrokeWidth you can adjust the width of the stroke.
                  .attr("stroke-width", StrokeWidth);
                  
                  if (Arrows == 'enabled'){
                  link.attr("marker-end", "url(#end)");
                }

                if (LineColor == 'enabled'){
                  if(data.fields[2]['name'] != 'count'){
                  throw new SplunkVisualizationBase.VisualizationError(
                    'No count field in results.  Either rename your count field or include it in the 3rd column as per the example'
                    );
                  }
                
                  link.style("stroke", function(d) { 
                      numberValue = Number(d[2])
                    if(numberValue <= ColorRange1){
                      return ColorRange1Code
                    }
                     else if(numberValue > ColorRange1 && numberValue <= ColorRange2){
                 
                      return ColorRange2Code
                    }
                    else if(numberValue > ColorRange2 && numberValue <= ColorRange3){
                 
                      return ColorRange3Code
                    }
                    else if(numberValue > ColorRange3 && numberValue <= ColorRange4){
                 
                      return ColorRange4Code
                    }
                    else if(numberValue > ColorRange4){
                 
                      return ColorRange5Code
                    }
                });
                }


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
              .style("fill",stringFill)
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
          //Create an empty node array for use in opacity
          node_list = [];
          //Create an empty node array to ensure that for loops don't go out of control
          temp_arr = [];
          //Push first member of array
          node_list.push(d);
          //Specify that the s variable responsible for how many links is set to 0
          var s = 0;              
          //Start the do function
              do{
              //For every node
              node.selectAll(function(n){
              //For every linked node
              node_list.forEach(function(nodeName)
              {
              //If the node is connected to another node
              if (isConnected(n,nodeName) === 1 || isConnected(n,nodeName) === true ){
                //If the array item is not in the node_list array
                  if (node_list.indexOf(n) === -1){
                //Push to the temporary array
                  temp_arr.push(n);
                  }  
                    } 
                  
                  });
              });
              //For each row in the temporary array
              temp_arr.forEach(function(tempNode){
                //If the array item is not in the node_list array
                if (node_list.indexOf(tempNode) === -1){
                  //Push to the node_list array
                  node_list.push(tempNode);
                  }  
              });
              //Clear the temporary array
              temp_arr = [];
              //Increment the counter of s
              s++;
              
            }
            //Perform the iteration no more than value of LinkLength
            while(s<LinkLength)

              node.selectAll(function(n){
                nodeObject = this;
                for (var i=0;i<node_list.length;i++){
                  
                  if (n === node_list[i]){
                      nodeObject.setAttribute('fill-opacity', 1);
                      nodeObject.setAttribute('stroke-opacity', 1);
                      break;
                  }
                  else{
                    nodeObject.setAttribute('fill-opacity', opacity);
                    nodeObject.setAttribute('stroke-opacity', opacity);
                  }
                }
              }); 
            
            link.selectAll(function(o) {  
              linkObject = this;
              for (var x=0;x<node_list.length;x++){              
                if (node_list.indexOf(o.source) >=0 && node_list.indexOf(o.target) >=0){ 
                      linkObject.setAttribute('opacity', 1);
                   break;
                } 
                else{ 
                  linkObject.setAttribute('opacity', opacity);
                }
              }
            });   
        
      }
                }

            function backgroundColour(bColour){
            if (bColour == 'light'){
              return "white"
            }
            else if(bColour == 'dark')
                return "#222"
            }

            function stringColour(tColour){
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
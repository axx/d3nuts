var myApp = angular.module('myApp', []);

myApp.controller('MyCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
	$rootScope.chart = [
	  {value: 15, label:'Call Back'},
	  {value: 5, label:'Candidate Not Interested'},
	  {value: 1, label:'Chase CV'},
	  {value: 2, label:'CVR'},
	  {value: 4, label:'Qualify'},
	  {value: 0, label:'Referral'},
	  {value: 0, label:'Reject'},
	  {value: 3, label:'CVs Received'}
	];
  $rootScope.chartTitle = "JL Jan 2016 Research Calls";
  $rootScope.chartCenter = "4H10";
  $rootScope.chartCenterSub = "Total Phone Time"
  $rootScope.chartRotation = 50;

	$scope.addSlice = function(idx) {
		$rootScope.chart.splice(idx+1, 0, {value: 1, label: 'Label'});
	};

	$scope.removeSlice = function(idx) {
		$rootScope.chart.splice(idx, 1);
	};
}]);

myApp.directive('donutChart', function() {
	function link(scope, el, attr) {
		var color = d3.scale.category20();
        var width = 0.75 * window.innerWidth;
        var height = 0.75 * window.innerHeight;
        var min = Math.min(width, height);
        var svgoffset = 150;
        var goff = 100;

        var svg = d3.select('#chart-container').append('svg');
        var pie = d3.layout.pie().sort(null);
        var outerRadius = min / 2 * 0.8;
        var innerRadius = min / 2 * 0.4;
        var arc = d3.svg.arc()
          .outerRadius(outerRadius)
          .innerRadius(innerRadius);
        var labelr = outerRadius + 30;
        scope.rotation = 50;

        pie.value(function(d){ return d.value; });
    
        svg.attr({width: width, height: height + svgoffset});
        var g = svg.append('g')
          // center the donut chart
          .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + goff) + ')');
        
        // add the <path>s for each arc slice
        var arcs = g.selectAll('path');
        var texts = g.selectAll('text');
        
        // add titles
        svg.append('text')
           .attr('class','title')
           .attr('x', width/2)
           .attr('y', 0.15 * height)
           .attr('text-anchor', 'middle')
           .style('font-size', function(d) { return Math.min(parseInt(0.2 * window.innerHeight), 36) + "px"; });
        svg.append('text')
           .attr('class','centertitle')
           .attr('x', width/2)
           .attr('y', height/2 + goff + 20)
           .attr('text-anchor', 'middle')
           .style('font-size', function(d) { return parseInt(0.7*innerRadius) + "px"; });
        svg.append('text')
           .attr('class','centersubtitle')
           .attr('x', width/2)
           .attr('y', height/2 + goff + 50)
           .attr('text-anchor', 'middle')
           .style('font-size', function(d) { return parseInt(0.15*innerRadius) + "px"; });

        scope.redrawChart = function() {
          var pdata = pie(scope.data);
          for (var i = 0; i < pdata.length; i++) {
            pdata[i].label = scope.data[i].label;
          }

          arcs = arcs.data(pie(scope.data));
          arcs.enter().append('path')
            .style('stroke', 'white')
            .attr('fill', function(d, i){ return color(i) });
          arcs.exit().remove();
          arcs.attr('d', arc);

          texts = texts.data(pdata);
          texts.enter().append('text')
               .attr('dy', '0.35em');
          texts.text(function(d) { return d.label + ", " + d.value; })
          texts.exit().remove();

          texts.attr("transform", function(d) {
                  var c = arc.centroid(d),
                      x = c[0],
                      y = c[1],
                      h = Math.sqrt(x*x + y*y),
                      nx = x/h * labelr,
                      ny = y/h * labelr;
                  return "translate(" + nx + "," + ny + ")";
                })
                .attr("text-anchor", function(d) {
                  var angle = (d.endAngle + d.startAngle)/2;
                  var sin = Math.sin(angle);
                  if (sin > 0) return "start";
                  if (sin < 0) return "end";
                  return "middle";
                })
                .attr("class", function(d, i) {
                  return "label" + i;
                });

          // Check for collision, which happens when 2 successive values are 0.
          // TODO: Have a better collision detection algorithm.
          var collision = [];
          for (var i = 1; i < scope.data.length; i++) {
            if (scope.data[i].value === 0 && scope.data[i-1].value === 0) {
              var label = "label"+i;
              var count = 0;
              for (var j = i-1; j >= 0; j--) {
                if (scope.data[j].value === scope.data[i].value) {
                  count += 1;
                }
              }
              collision.push({label:label, count:count});
            }
          }
          collision.forEach(function(coltxt) {
            // Move each collided text
            var text = g.selectAll('text.' + coltxt.label).attr('transform', function(d) {
              var c = arc.centroid(d),
                  x = c[0],
                  y = c[1],
                  h = Math.sqrt(x*x + y*y),
                  nx = x/h * (labelr + coltxt.count * 30),
                  ny = y/h * (labelr + coltxt.count * 30);
              return "translate(" + nx + "," + ny + ")";
            });
          });
        };

        scope.$watch('title', function(title) {
          svg.selectAll('text.title').text(title);
        });

        scope.$watch('center', function(center) {
          svg.selectAll('text.centertitle').text(center);
        });

        scope.$watch('centersub', function(centersub) {
          svg.selectAll('text.centersubtitle').text(centersub);
        });

        scope.$watch('rotation', function(rotation) {
          var start = 2*Math.PI * (rotation - 50)/100;
          var end = start + 2*Math.PI;
          pie.startAngle(start).endAngle(end);

          scope.rotation = rotation;

          scope.redrawChart();
        });

        scope.$watch('data', function(data){
          scope.data = data;

          scope.redrawChart();
        }, true);
    }
    return {
    	link: link,
    	restrict: 'E',
        scope: { data: '=', title:'=', center:'=', centersub:'=', rotation:'='}
    };
});

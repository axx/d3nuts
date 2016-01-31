var myApp = angular.module('myApp', []);

myApp.controller('MyCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
	$rootScope.chart = [
	  {value: 30, label:'Call Back'},
	  {value: 5, label:'Candidate Not Interested'},
	  {value: 1, label:'Chase CV'},
	  {value: 2, label:'CVR'},
	  {value: 4, label:'Qualify'},
	  {value: 0, label:'Referral'},
	  {value: 0, label:'Reject'},
	  {value: 3, label:'CVs Received'}
	];

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

        var svg = d3.select('#chart-container').append('svg');
        var pie = d3.layout.pie().sort(null);
        var arc = d3.svg.arc()
          .outerRadius(min / 2 * 0.9)
          .innerRadius(min / 2 * 0.5);

        pie.value(function(d){ return d.value; });
    
        svg.attr({width: width, height: height});
        var g = svg.append('g')
          // center the donut chart
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
        
        // add the <path>s for each arc slice
        var arcs = g.selectAll('path');
        var texts = g.selectAll('text');

        scope.$watch('data', function(data){
          arcs = arcs.data(pie(data));
          arcs.enter().append('path')
            .style('stroke', 'white')
            .attr('fill', function(d, i){ return color(i) });
          arcs.exit().remove();
          arcs.attr('d', arc);

          texts = texts.data(data);
          texts.enter().append('text')
               .attr('x', 100)
               .attr('y', function(d, i) {
                  return i * 32;
               })
               .attr('dy', '0.35em')
               .attr("text-anchor", "middle");
          texts.text(function(d) { return d.label; })
          texts.exit().remove();
        }, true);
    }
    return {
    	link: link,
    	restrict: 'E',
        scope: { data: '=' }
    };
});
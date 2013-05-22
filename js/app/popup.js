myApp.controller('TabsetsController', function($scope) {
	$scope.message = "Greetings!";

		$scope.tabsets = [
			{
				name:"AngularJS tuts",
				tabs: [
					{ url:"http://angularjs.org/#!/", title:"AngularJS — Superheroic JavaScript MVW Framework" },
					{ url:"http://docs.angularjs.org/#!/tutorial", title:"AngularJS: Tutorial" },
					{ url:"http://builtwith.angularjs.org/", title:"Built with AngularJS" },
					{ url:"https://github.com/angular/angular-seed", title:"angular/angular-seed" }
				],
				created:"2013-05-21 11:04",
				isExpanded:false
			},
			{
				name:"Canoe Sailing",
				tabs: [],
				created:"2013-05-20 18:46",
				isExpanded:false
			},
			{
				name:"Bushcrafting",
				tabs: [],
				created:"2013-04-12 19:49",
				isExpanded:false
			}
		];

		$scope.toggle = function(tabset) {
			tabset.isExpended = !tabset.isExpended;
		}

		$scope.newTabset = function() {
			console.log($scope.newTabsetName);
			$scope.tabsets.push({
				name:$scope.newTabsetName,
				tabs:[],
				created:(new Date).toString(),
				isExpanded:false
			});
			$scope.newTabsetName = '';
			window.close();
		}
});

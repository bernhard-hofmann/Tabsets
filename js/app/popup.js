myApp.controller('TabsetsController', function($scope) {
	$scope.message = "Greetings!";
/*
	chrome.tabs.query({'active':true}, function(tabs) {
		debugger;
		if (tabs.length > 0) {
			$scope.title = tabs[0].title;
			$scope.url = tabs[0].url;
			
			chrome.tabs.sendMessage(tabs[0].id, {'action': 'PageInfo'}, function(response) {
				$scope.pageInfos = response;
				$scope.$apply();
			});
		}
	});
*/
});

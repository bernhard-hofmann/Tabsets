myApp.controller('TabsetsController', function($scope) {
	chrome.storage.sync.get(null, function(blob) {
		console.log(blob);
		$scope.tabsets = blob.tabsets;
		$scope.$apply();
	});

	$scope.toggle = function(tabset) {
		tabset.isExpended = !tabset.isExpended;
	}

	$scope.newTabset = function() {
		var tablist = [];
		function formattedDateString(d){
			function pad(n){return n<10 ? '0'+n : n}
			return d.getUTCFullYear()+'-'+ pad(d.getUTCMonth()+1)+'-'+ pad(d.getUTCDate())+' '
				+ pad(d.getUTCHours())+':'+ pad(d.getUTCMinutes());
		}

		chrome.tabs.query({currentWindow:true}, function(tabs) {
			for (var tabIx=0; tabIx<tabs.length; tabIx++) {
				var tab = tabs[tabIx];
				tablist.push({
					title:tab.title,
					url:tab.url
				});
			}

			var formattedDate = formattedDateString(new Date);
			$scope.tabsets.push({
				name:$scope.newTabsetName,
				tabs:tablist,
				created:formattedDate,
				isExpanded:false
			});

			$scope.newTabsetName = '';
			$scope.$apply();

			chrome.storage.sync.set({'tabsets' : $scope.tabsets});
			//window.close();
		});
	}

	$scope.delTabset = function(tabset) {
		if (window.confirm("Are you sure you want to remove '"+ tabset.name +"' permanently?")) {
			var ix = -1;
			for (i=0;i<$scope.tabsets.length;i++) {
				if ($scope.tabsets[i].name === tabset.name) {
					ix = i;
					break;
				}
			}
			$scope.tabsets.splice(ix,1);
			$scope.$apply();
			chrome.storage.sync.set({'tabsets' : $scope.tabsets});
		}
	}

	$scope.openTabset = function(tabset) {
		for (var i=0; i< tabset.tabs.length; i++) {
			chrome.tabs.create({
				url : tabset.tabs[i].url,
				active : false
			});
		}
		window.close();
	}
});

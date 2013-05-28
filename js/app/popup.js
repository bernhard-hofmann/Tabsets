var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-5243256-6']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

myApp.controller('TabsetsController', function($scope) {
	chrome.storage.sync.get(null, function(blob) {
		$scope.tabsets = [];

		if (blob.count > 0) {
			for (var i=0; i<blob.count; i++) {
				$scope.tabsets.push(blob['tabset_'+i]);
			}
			$scope.$apply();
		}
	});

	$scope.toggle = function(tabset) {
		tabset.isExpanded = !tabset.isExpanded;
	}

	function storeTabsets(tabsets) {
		chrome.storage.sync.clear();
		chrome.storage.sync.set({'count':tabsets.length});
		for (i=0; i<tabsets.length; i++) {
			var key = 'tabset_'+i;
			var val = tabsets[i];
			var obj = {};
			obj[key] = val;
			chrome.storage.sync.set(obj);
		}
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

			storeTabsets($scope.tabsets);
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
			storeTabsets($scope.tabsets);
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

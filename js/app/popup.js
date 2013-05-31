var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-5243256-6']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

myApp.controller('TabsetsController', function($scope) {
	'use strict';

	var manifest = chrome.runtime.getManifest();
	$scope.name = manifest.name;
	$scope.version = manifest.version;

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
	};

	function storeTabsets(tabsets) {
		var obj = {'count':tabsets.length};
		chrome.storage.sync.clear();
		for (var i=0; i<tabsets.length; i++) {
			obj['tabset_'+i] = tabsets[i];
		}
		chrome.storage.sync.set(obj);
	}

	$scope.newTabset = function() {
		var tablist = [];
		function formattedDateString(d) {
			function pad(n) {
				return n<10 ? '0'+n : n;
			}
			return d.getUTCFullYear()+'-'+ pad(d.getUTCMonth()+1)+'-'+ pad(d.getUTCDate())+' '+ pad(d.getUTCHours())+':'+ pad(d.getUTCMinutes());
		}

		chrome.tabs.query({currentWindow:true}, function(tabs) {
			for (var tabIx=0; tabIx<tabs.length; tabIx++) {
				var tab = tabs[tabIx];
				tablist.push({
					title:tab.title,
					url:tab.url
				});
			}

			var formattedDate = formattedDateString(new Date());
			$scope.tabsets.push({
				name:$scope.newTabsetName,
				tabs:tablist,
				created:formattedDate,
				isExpanded:false
			});

			$scope.newTabsetName = '';
			$scope.$apply();

			storeTabsets($scope.tabsets);
			var _gaq = _gaq || [];
			_gaq.push(['_trackEvent', 'Tabset', 'Created']);

			//window.close();
		});
	};

	$scope.delTabset = function(tabset) {
		if (window.confirm("Are you sure you want to remove the '"+ tabset.name +"' tabset permanently?")) {
			var ix = -1;
			for (var i=0; i<$scope.tabsets.length; i++) {
				if ($scope.tabsets[i].name === tabset.name) {
					ix = i;
					break;
				}
			}
			$scope.tabsets.splice(ix,1);
			$scope.$apply();
			storeTabsets($scope.tabsets);

			var _gaq = _gaq || [];
			_gaq.push(['_trackEvent', 'Tabset', 'Deleted']);
		}
	};

	$scope.openTabset = function(tabset) {
		chrome.tabs.query({currentWindow:true}, function(tabs) {
			for (var i=0; i< tabset.tabs.length; i++) {
				chrome.tabs.create({
					url : tabset.tabs[i].url,
					active : false
				});
			}

			if (tabs.length === 1 && tabs[0].title === "New Tab" && tabs[0].url === "chrome://newtab/") {
				chrome.tabs.remove(tabs[0].id);
			}

			var _gaq = _gaq || [];
			_gaq.push(['_trackEvent', 'Tabset', 'Opened']);
			window.close();
		});
	};
});
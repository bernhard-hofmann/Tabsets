var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-5243256-6']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

myApp.controller('TabsetsController', function ($scope) {
	'use strict';

	var manifest = chrome.runtime.getManifest();
	$scope.name = manifest.name;
	$scope.version = manifest.version;

	$scope.importing = false;
	$scope.importedTabset = '';

	chrome.storage.sync.get(null, function (blob) {
		$scope.tabsets = [];

		if (blob.count > 0) {
			for (var i = 0; i < blob.count; i++) {
				$scope.tabsets.push(blob['tabset_' + i]);
			}
			$scope.$apply();
		}
	});

	$scope.toggle = function (tabset) {
		tabset.isExpanded = !tabset.isExpanded;
	};

	function storeTabsets(tabsets) {
		var obj = { 'count': tabsets.length };
		var tabset;

		for (var i = 0; i < tabsets.length; i++) {
			tabset = JSON.parse(JSON.stringify(tabsets[i]));
			delete tabset.isExpanded;
			delete tabset.$$hashKey;
			for (var t = 0; t < tabset.tabs.length; t++) {
				delete tabset.tabs[t].$$hashKey;
			}
			obj['tabset_' + i] = tabset;
		}

		chrome.storage.sync.set(obj, function () {
			var error = chrome.runtime.lastError;
			if (error) {
				_gaq.push(['_trackEvent', 'Tabset', 'Error', error.message]);
				window.alert(error.message);
			}
		});
	}

	$scope.newTabset = function () {
		var tablist = [];
		function formattedDateString(d) {
			function pad(n) {
				return n < 10 ? '0' + n : n;
			}
			return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
		}

		chrome.tabs.query({ currentWindow: true }, function (tabs) {
			for (var tabIx = 0; tabIx < tabs.length; tabIx++) {
				var tab = tabs[tabIx];
				tablist.push({
					title: tab.title,
					url: tab.url
				});
			}

			var formattedDate = formattedDateString(new Date());
			$scope.tabsets.push({
				name: $scope.newTabsetName,
				tabs: tablist,
				created: formattedDate,
				isExpanded: false
			});

			$scope.newTabsetName = '';
			$scope.$apply();

			storeTabsets($scope.tabsets);
			_gaq.push(['_trackEvent', 'Tabset', 'Created']);
		});
	};

	$scope.delTabset = function (tabset) {
		if (window.confirm("Are you sure you want to remove the '" + tabset.name + "' tabset permanently?")) {
			var ix = -1;
			for (var i = 0; i < $scope.tabsets.length; i++) {
				if ($scope.tabsets[i].$$hashKey === tabset.$$hashKey) {
					ix = i;
					break;
				}
			}
			$scope.tabsets.splice(ix, 1);
			try {
				$scope.$apply();
			} catch (e) {
				// Assume apply is already in progress
			}
			storeTabsets($scope.tabsets);

			_gaq.push(['_trackEvent', 'Tabset', 'Deleted']);
		}
	};

	$scope.renTabset = function (tabset) {
		var result = window.prompt("Enter the new name for the tabset '" + tabset.name + "'", tabset.name);
		if (result !== null) {
			if (result.length < 1) {
				alert('You cannot give a tabset a blank name.');
				return;
			}

			tabset.name = result;
			storeTabsets($scope.tabsets);
			_gaq.push(['_trackEvent', 'Tabset', 'Renamed']);
		}
	};

	$scope.exportTabset = function (tabset) {
		// Make a deep copy of the tabset
		var temp = JSON.parse(JSON.stringify(tabset));

		// Strip Angular properties
		delete temp.$$hashKey;
		for (var i = temp.tabs.length - 1; i >= 0; i--) {
			delete temp.tabs[i].$$hashKey;
		}

		$scope.exportedTabset = JSON.stringify(temp);
		_gaq.push(['_trackEvent', 'Tabset', 'Exported']);
	};

	$scope.exportDone = function (tabset) {
		delete $scope.exportedTabset;
	};

	$scope.importTabset = function () {
		$scope.importing = true;
	};

	$scope.importDone = function (tabset) {
		try {
			var action = "Imported";
			var importedTabsets = [];
			var imported = JSON.parse($scope.importedTabset);
			if (Array.isArray(imported)) {
				action = "ImportedMultiple";
				importedTabsets = imported;
			} else {
				importedTabsets.push(imported);
			}

			importedTabsets.forEach(function (importedTabset) {
				if (!importedTabset.hasOwnProperty('name') || !importedTabset.hasOwnProperty('tabs') || !importedTabset.hasOwnProperty('created')
					|| !Array.isArray(importedTabset.tabs)) {
					throw 'Invalid object';
				}
				$scope.tabsets.push(importedTabset);
			});

			storeTabsets($scope.tabsets);

			$scope.importedTabset = '';
			$scope.importing = false;
			_gaq.push(['_trackEvent', 'Tabset', 'Imported']);
		} catch (e) {
			alert("Sorry, that tabset text doesn\'t appear to be correctly formatted.");
		}
	};

	$scope.exportAllTabsets = function () {
		try {
			var allTabsets = JSON.parse(JSON.stringify($scope.tabsets));

			allTabsets.forEach(function (temp) {
				// Strip Angular properties
				delete temp.$$hashKey;
				for (var i = temp.tabs.length - 1; i >= 0; i--) {
					delete temp.tabs[i].$$hashKey;
				}
			});

			$scope.exportedTabset = JSON.stringify(allTabsets);
			_gaq.push(['_trackEvent', 'Tabset', 'ExportAllTabsets']);
		} catch (e) {
			alert("Sorry, that tabset text doesn\'t appear to be correctly formatted.");
		}
	};

	$scope.openTabset = function (tabset) {
		chrome.tabs.query({ currentWindow: true }, function (tabs) {
			for (var i = 0; i < tabset.tabs.length; i++) {
				chrome.tabs.create({
					url: tabset.tabs[i].url,
					active: false
				});
			}

			if (tabs.length === 1 && tabs[0].title === "New Tab" && tabs[0].url === "chrome://newtab/") {
				chrome.tabs.remove(tabs[0].id);
			}

			_gaq.push(['_trackEvent', 'Tabset', 'Opened']);
			window.close();
		});
	};

	$scope.addCurrentTabToTabset = function (tabset) {
		chrome.tabs.query({ currentWindow: true }, function (tabs) {
			var activeTab;
			for (var t = 0; t < tabs.length; t++) {
				if (tabs[t].active) {
					activeTab = tabs[t];
					break;
				}
			}

			if (activeTab) {
				tabset.tabs.push({
					title: activeTab.title,
					url: activeTab.url
				});

				$scope.$apply();
				storeTabsets($scope.tabsets);
				_gaq.push(['_trackEvent', 'Tabset', 'TabAdded']);
			} else {
				alert('Oops, I could not find an active tab. Please try again.');
			}
		});
	};

	$scope.moveTabUp = function (tab, tabset) {
		var spliceIndex;
		for (var t = 0; t < tabset.tabs.length; t++) {
			if (tabset.tabs[t].url === tab.url) {
				spliceIndex = t;
				break;
			}
		}

		if (spliceIndex === 0) {
			window.alert("This tab is already at the top of the list.");
		} else {
			var tab = tabset.tabs[spliceIndex];
			tabset.tabs.splice(spliceIndex, 1);
			tabset.tabs.splice(spliceIndex - 1, 0, tab);
			storeTabsets($scope.tabsets);
			_gaq.push(['_trackEvent', 'Tabset', 'TabMoved']);
		}
	};

	$scope.moveTabDn = function (tab, tabset) {
		var spliceIndex;
		for (var t = 0; t < tabset.tabs.length; t++) {
			if (tabset.tabs[t].url === tab.url) {
				spliceIndex = t;
				break;
			}
		}

		if (spliceIndex >= tabset.tabs.length - 1) {
			window.alert("This tab is already at the bottom of the list.");
		} else {
			var tab = tabset.tabs[spliceIndex];
			tabset.tabs.splice(spliceIndex, 1);
			tabset.tabs.splice(spliceIndex + 1, 0, tab);
			storeTabsets($scope.tabsets);
			_gaq.push(['_trackEvent', 'Tabset', 'TabMoved']);
		}
	};

	$scope.removeTabFromTabset = function (tab, tabset) {
		var spliceIndex;
		for (var t = 0; t < tabset.tabs.length; t++) {
			if (tabset.tabs[t].url === tab.url) {
				spliceIndex = t;
				break;
			}
		}
		tabset.tabs.splice(spliceIndex, 1);

		storeTabsets($scope.tabsets);
		_gaq.push(['_trackEvent', 'Tabset', 'TabRemoved']);
	};

	$scope.sortByName = function () {
		$scope.tabsets.sort(function (a, b) {
			return a.name < b.name ? -1 : 1;
		});

		storeTabsets($scope.tabsets);
		_gaq.push(['_trackEvent', 'Tabset', 'TabRemoved']);
	};

	$scope.sortByDate = function () {
		$scope.tabsets.sort(function (a, b) {
			return a.created < b.created ? -1 : 1;
		});

		storeTabsets($scope.tabsets);
		_gaq.push(['_trackEvent', 'Tabset', 'TabRemoved']);
	};

	$scope.openUrl = function (url) {
		chrome.tabs.create({ url: url, active: true });
		_gaq.push(['_trackEvent', 'Tabset', 'OpenUrl_' + url]);
	};
});

chrome.extension.onMessage.addListener(function(request, sender, sendMessage) {
	debugger;
	
	if (request.action == "PageInfo") {
		var pageInfos = [];
		$('a').each(function() {
			var pageInfo = {};
			var href = $(this).attr('href');
			if (href != null && href.indexOf("http") == 0) {
				pageInfo.url = href;
				pageInfos.push(pageInfo);
			}
		});

		sendResponse(pageInfos);
	}
});
/*
chrome.browserAction.setBadgeText({text: "0"});
console.log("Loaded.");

chrome.runtime.onInstalled.addListener(function() {
  console.log("Installed.");
});

chrome.browserAction.onClicked.addListener(function() {
});

chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.create({url: "http://www.google.com/"});
});
*/
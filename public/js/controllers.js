'use strict';

/* Controllers */

function HomeCtrl($scope, $http) {
	function getIP(cb) {
		var startTime = new Date();

		ipService.get(function(user) {
			var endTime = new Date();
			cb({
				obj: user,
				time: (endTime - startTime) / 1000
			});
		});
	}

	$scope.refresh = function() {
		getIP(function(data) {
			$scope.ip = data.obj.ip;
			$scope.time = data.time;
			$scope.$digest();
		});
	};

	prettyPrint();
	$scope.refresh();
}

function DocsCtrl() {
	prettyPrint();
}
DocsCtrl.$inject = [];


function ContactCtrl() {
}
ContactCtrl.$inject = [];
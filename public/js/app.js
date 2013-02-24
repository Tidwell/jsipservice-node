'use strict';


// Declare app level module which depends on filters, and services
angular.module('jsIPService', ['jsIPService.filters', 'jsIPService.services', 'jsIPService.directives'])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider.when('/home', {
			templateUrl: 'partials/home',
			controller: HomeCtrl
		});
		$routeProvider.when('/docs', {
			templateUrl: 'partials/docs',
			controller: DocsCtrl
		});
		$routeProvider.when('/contact', {
			templateUrl: 'partials/contact',
			controller: ContactCtrl
		});
		$routeProvider.otherwise({
			redirectTo: '/home'
		});
		$locationProvider.html5Mode(true);
	}]);
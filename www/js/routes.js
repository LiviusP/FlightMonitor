angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

  .state('login', {
    url: '/page5',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/page6',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('home', {
    url: '/page8',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('userInfo', {
    url: '/page9',
    templateUrl: 'templates/userInfo.html',
    controller: 'userInfoCtrl'
  })

  .state('monitor', {
    url: '/page10',
    params: {
      inFlight : true
    },
    templateUrl: 'templates/monitor.html',
    controller: 'monitorCtrl'
  })

  .state('changePassword', {
    url: '/page11',
    templateUrl: 'templates/change-password.html',
    controller: 'changePasswordCtrl'
  })

  .state('mapPage', {
    url: '/page12',
    templateUrl: 'templates/map-page.html',
    controller: 'mapPageCtrl'
  })

  .state('soundMarker', {
    url: '/page13',
    templateUrl: 'templates/sound-marker.html',
    controller: 'soundMarkerCtrl'
  })

$urlRouterProvider.otherwise('/page5')

  

});
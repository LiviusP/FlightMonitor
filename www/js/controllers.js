angular.module('app.controllers', [])
     
.controller('loginCtrl', function($scope,AuthService,$window,$state,UserService,$ionicPopup) {

// at the bottom of your controller
	var init = function () {
   		$scope.error = false;
		$window.localStorage['token'] = '';
		$scope.formData = {
			email: "",
			password: ""
		};
	};
	init();

	
	$scope.formData = {
		email: "",
		password: ""
		};   
	 
	$scope.error = false;
	$scope.handleLogin = function(){

	if ($scope.formData.email && $scope.formData.password){
		
		AuthService.authLocal($scope.formData.email , $scope.formData.password).then(function(res){
			console.log(res);
			if (res.status === 200) {
				$window.localStorage['token'] = res.data.token;
				$scope.error = false;
				$state.go('home');
			} else {
				$scope.error = true;
			}
		}, function(err){
			$scope.error = true;
		});
		
		
	} else {
			$scope.error = true;
		}
	};

	$scope.handleFacebook = function(){
		AuthService.authFacebook().then(function(res){

		});

	}


	$scope.handlePasswordReset = function() {

		if ($scope.formData.email) {
			UserService.resetPassword($scope.formData.email).then(function(res){
					
					$ionicPopup.alert({
									    title: 'Password was reset!',
									    template: 'You can now login using your new password that was sent to you in an email!'
									  });
					$state.go('login');

			}, function(err){
				$scope.error = true;
			});
		} else {
			$scope.error = true;
		} 
	}

})
   
.controller('signupCtrl', function($scope,AuthService,$state,$ionicPopup) {

	$scope.formData = {
		name : "",
		email : "",
		password : "",
		passwordC : ""
	};

	$scope.errorEmail = false;
	$scope.errorCredentials = false;
	$scope.errorPassword = false;

	$scope.handleSingUp = function(){

		$scope.errorEmail = false;
		$scope.errorCredentials = false;
		$scope.errorPassword = false;

		if ($scope.formData.name !== "" && $scope.formData.email !== "" && $scope.formData.password !== "") {
			if ($scope.formData.password === $scope.formData.passwordC) {
					AuthService.authSingUp($scope.formData.email , $scope.formData.password, $scope.formData.name).then(function(res){
						if (res.status === 200) {
									$ionicPopup.alert({
									    title: 'Account created!',
									    template: 'You have to confirm your email before using the account!'
									  });
					$state.go('login');
						}
					},function(res){
					    $scope.errorEmail = true;
					});
			} else {
				$scope.errorPassword = true;
			}
		} else {
			$scope.errorCredentials = true;
		}
	}

	 $scope.$on('modal.hidden', function() {
    	$state.go('login');
  });

	$scope.closeModal = function() {
    $scope.modal.hide();
  };

})
   
.controller('homeCtrl', function($scope) {


})
   
.controller('userInfoCtrl', function($scope,AuthService) {

	$scope.user = {};

	AuthService.getUserInfo().then(function(res){
			$scope.user.name = res.data.name;
			$scope.user.email = res.data.email;
			$scope.user.requests = res.data.requests;
	});


})

.controller('changePasswordCtrl', function($scope,UserService,$ionicPopup,$state) {

		$scope.formData = {
			passwordOld : "",
			passwordNew : "",
			passwordNewConfirm : ""
		};
		$scope.error = false;
		$scope.errorNoMatch = false;

		$scope.handleChangePassword = function() {

				if ($scope.passwordNewConfirm === $scope.passwordNew) {

					UserService.changePassword($scope.formData.passwordOld, $scope.formData.passwordNew).then(function(res){

						if (res.status === 200) {

							$ionicPopup.alert({
									    title: 'Password was succesfully changed!',
									    template: 'You can now login using your new password!'
						     			  });
							$state.go('userInfo');

						} else {
							$scope.error = true;
						}

					}, function(err){
						$scope.error = true;
					});


				} else {
					$scope.errorNoMatch = true;
				}
		}
})
   
.controller('monitorCtrl', function($scope,PlanesService,$interval,$stateParams) {

ionic.Platform.ready(function(){
	    // will execute when device is ready, or immediately if the device is already ready.
		$scope.flightsInSight = [];
		$scope.flightsNear = [];
		$scope.dbmeter = 0;
		var pastHeading = {}; 
		var lastCall = {};
		var coordinates = {};
		var watchId = {};


		DBMeter.delete();

		var subscription = DBMeter.start(function(data){
			if (Math.round(data) != $scope.dbmeter) {
				$scope.dbmeter = Math.round(data);
				if(!$scope.$$phase) {
		  					$scope.$apply();
						}
			}
		});

		//camera backgroud
		var tapEnabled = false; //enable tap take picture
	    var dragEnabled = false; //enable preview box drag across the screen
	    var toBack = true; //send preview box to the back of the webview
	    var rect = {x: 0, y: 0, width: window.screen.width, height:window.screen.height};
	   // cordova.plugins.camerapreview.startCamera(rect, "front", tapEnabled, dragEnabled, toBack);


	    //geolocation coordinates
	    navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation , {timeout: 10000, enableHighAccuracy: true});


	    function onSuccessGeolocation(position) {
	    	coordinates = {
	    		latitude : position.coords.latitude , 
	    		longitude : position.coords.longitude,
	    		timestamp : position.timestamp
	    	};
	    	
	    	if ($stateParams.inFlight === true) {

	    		console.log("MONITOR");
		    	PlanesService.getPlanesNear(coordinates).then(function(data){
		    	
			    	$scope.flightsNear = data.data;
			    	
			    	console.log($scope.flightsNear);

			    	if(!$scope.$$phase) {
	  					$scope.$apply();
					}


				setTimeout(function(){
					var myVar = setInterval(refreshPlanesNear(coordinates), 120000);
				}, 120000);
			    	
				});
	    	} else {
	    		console.log("HISTORY");
	    		PlanesService.getPastPlanes(coordinates).then(function(data){
		    	
		    		console.log(data);

			    	$scope.flightsNear = data.data;
			    	
			    	console.log($scope.flightsNear);

			    	if(!$scope.$$phase) {
	  					$scope.$apply();
					}
				});
	    	}
	    };

	    
		function onErrorGeolocation(error) {
	    	console.log('code: '    + error.code    + '\n' +
	    	      'message: ' + error.message + '\n');
		}



	    function refreshPlanesNear(coordinates){
		    navigator.compass.clearWatch(watchId);
		    PlanesService.getPlanesNear(coordinates).then(function(data){
		    	
		    	$scope.flightsNear = data.data;
		    	

		    	if(!$scope.$$phase) {
  					$scope.$apply();
				}
		    	
		    });
	    };
 	});
})
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

.controller('mapPageCtrl', function($scope,MarkerService) {

	ionic.Platform.ready(function(){

		navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation , {timeout: 10000, enableHighAccuracy: true});


		function onSuccessGeolocation(position) {
				var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
			    var mapOptions = {
			      center: latLng,
			      zoom: 15,
			      mapTypeId: google.maps.MapTypeId.ROADMAP
			    };
 
    			$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);


    			google.maps.event.addListenerOnce($scope.map, 'idle', function(){
 
				MarkerService.getMarkers().then(function(res){

					console.log(res.data);
					res.data.forEach(function(markerData){	

					  var latLng = new google.maps.LatLng(markerData.point.latitude, markerData.point.longitude);	
					  
					  var marker = new google.maps.Marker({
					      map: $scope.map,
					      animation: google.maps.Animation.DROP,
					      position: latLng
					  });      
					 
					  var infoWindow = new google.maps.InfoWindow({
					      content: markerData.user + " : " +  markerData.data.soundLevel + "Db  with " + markerData.data.numberOfPlanes + " planes near."
					  });
					 
					  google.maps.event.addListener(marker, 'click', function () {
					      infoWindow.open($scope.map, marker);
					  });
					
					});
					
					});

				}); 	

		};

		function onErrorGeolocation(error) {
	    	console.log('code: '    + error.code    + '\n' +
	    	      'message: ' + error.message + '\n');
		}


	});
})
   
.controller('soundMarkerCtrl', function($scope,MarkerService,$ionicPopup,$state){

	ionic.Platform.ready(function(){

		$scope.dbmeter = 0;

		var g = new JustGage({
				    id: "gauge",
				    value: $scope.dbmeter,
				    min: 0,
				    max: 150,
				    title: "Decibels",
				    valueFontColor: 'black',
				    titleFontColor: 'black'
				  });

		DBMeter.delete();

		var subscription = DBMeter.start(function(data){
			if (Math.round(data) != $scope.dbmeter) {
				$scope.dbmeter = Math.round(data);
				if(!$scope.$$phase) {
		  					$scope.$apply();
						}
				g.refresh($scope.dbmeter);

			}
		});

		$scope.shareMarker = function() {


		navigator.geolocation.getCurrentPosition(function(position) {
			
			var positionData = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			};

			var data = {
				data: $scope.dbmeter,
				point: positionData
			};

			MarkerService.addMarker(data).then(function(){
				$ionicPopup.alert({
									    title: 'Your info was succesfully shared!',
									    template: 'Other users are now able to see your shared information'
						     			  });
				$state.go('home');
			});

			}, function(error){console.log(error)} , {timeout: 10000, enableHighAccuracy: true});


		};

	})
})   


.controller('monitorCtrl', function($scope,PlanesService,$interval,$stateParams,MarkerService,$ionicPopup) {

ionic.Platform.ready(function(){
	    // will execute when device is ready, or immediately if the device is already ready.
		$scope.flightsInSight = [];
		$scope.flightsNear = [];
		$scope.live = false;
		var pastHeading = {}; 
		var lastCall = {};
		var coordinates = {};
		var watchId = {};
		var positionData = {};



		//camera backgroud
		var tapEnabled = false; //enable tap take picture
	    var dragEnabled = false; //enable preview box drag across the screen
	    var toBack = true; //send preview box to the back of the webview
	    var rect = {x: 0, y: 0, width: window.screen.width, height:window.screen.height};
	   // cordova.plugins.camerapreview.startCamera(rect, "front", tapEnabled, dragEnabled, toBack);


	   //sound marker

		$scope.dbmeter = 0;

		var g = new JustGage({
				    id: "gauge",
				    value: $scope.dbmeter,
				    min: 0,
				    max: 150,
				    title: "Decibels",
				    valueFontColor: 'black',
				    titleFontColor: 'black'
				  });

		DBMeter.delete();

		var subscription = DBMeter.start(function(data){
			if (Math.round(data) != $scope.dbmeter) {
				$scope.dbmeter = Math.round(data);
				if(!$scope.$$phase) {
		  					$scope.$apply();
						}
				g.refresh($scope.dbmeter);

			}
		});


		$scope.shareMarker = function() {


			var data = {
				data: {
						soundLevel : $scope.dbmeter,
						numberOfPlanes : $scope.flightsNear.length
					},
				point: positionData
			};

			MarkerService.addMarker(data).then(function(){
				$ionicPopup.alert({
									    title: 'Your info was succesfully shared!',
									    template: 'Other users are now able to see your shared information'
						     			  });
				$state.go('home');
			});

		};



	    //geolocation coordinates
	    navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation , {timeout: 10000, enableHighAccuracy: true});


	    function onSuccessGeolocation(position) {
	    	coordinates = {
	    		latitude : position.coords.latitude , 
	    		longitude : position.coords.longitude,
	    		timestamp : position.timestamp
	    	};

	    	positionData = {
	    		latitude : position.coords.latitude , 
	    		longitude : position.coords.longitude
	    	};
	    	
	    	if ($stateParams.inFlight === true) {

	    		console.log("MONITOR");
		    	PlanesService.getPlanesNear(coordinates).then(function(data){
		    	
			    	$scope.flightsNear = data.data;
			    	$scope.live = true;
			    	console.log($scope.flightsNear);

			    	if(!$scope.$$phase) {
	  					$scope.$apply();
					}

					$scope.$broadcast('scroll.refreshComplete');
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

					$scope.$broadcast('scroll.refreshComplete');
				});
	    	}
	    };

	    
		function onErrorGeolocation(error) {
	    	console.log('code: '    + error.code    + '\n' +
	    	      'message: ' + error.message + '\n');
		}


	    $scope.doRefresh = function() {
	    	 navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation , {timeout: 10000, enableHighAccuracy: true});
	    }
 	});
})
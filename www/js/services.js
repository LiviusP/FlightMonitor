angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.service('ConfigService', [function(){

	var service = {
		getHost : function() {
			return "http://192.168.1.9:9000";
            //return "https://flightmonitorbackend.herokuapp.com";
		}
	}

	return service;
}])

.service('PlanesService', ['$http' , '$window','ConfigService' , function($http,$window,ConfigService){

    var service = {

    	 getPlanesInSight : function(heading, planes){
    	 	
    	 	//TODO filter using heading
			console.log(planes);
			return planes;
    	},
    	getPlanesNear : function(coordinates){

    		console.log(coordinates);
    		var link = ConfigService.getHost() + '/api/planesData?lat=' + coordinates.latitude + '&long=' + coordinates.longitude;
    		return $http.get(link,{headers: {'Authorization': 'Bearer ' + $window.localStorage['token']}})

    	},
        getPastPlanes: function(coordinates){

            console.log(coordinates);
            var link = ConfigService.getHost() + '/api/pastPlanesData?lat=' + coordinates.latitude + '&long=' + coordinates.longitude;
            return $http.get(link,{headers: {'Authorization': 'Bearer ' + $window.localStorage['token']}})

        }
    };

    return service;
}])

.service('MarkerService' ,['$http','ConfigService', '$window' , function($http,ConfigService,$window){

    var service = {

        getMarkers : function() {
            var link = ConfigService.getHost() + '/api/soundMarkers';
            return $http.get(link,{headers: {'Authorization': 'Bearer ' + $window.localStorage['token']}})

        },

        addMarker : function(data) {
               var link = ConfigService.getHost() + '/api/soundMarkers/add';

                return $http.put(link,data,
                                          {
                                            headers: {'Authorization': 'Bearer ' + $window.localStorage['token']}
                                          })
        }

    };

    return service;
 }])

.service('UserService' , ['$http' , 'ConfigService' , '$window' , function($http,ConfigService,$window){

    var service = {

        changePassword : function(passwordOld, passwordNew) {
                var link = ConfigService.getHost() + '/api/users/password';

                return $http.put(link,{
                                            oldPassword: passwordOld,
                                            newPassword: passwordNew
                                        },
                                          {
                                            headers: {'Authorization': 'Bearer ' + $window.localStorage['token']}
                                          })
        },

        resetPassword : function(email) {
                var link = ConfigService.getHost() + '/api/users/password/reset';

                return $http.post(link, {email : email});

        }

    };

    return service;
}])

.service('AuthService' , ['$http' , '$window','ConfigService' , function($http,$window,ConfigService){

	var service = {

		authLocal : function (email ,password){

                 var link = ConfigService.getHost() + '/auth/local';
                 //var link = "http://192.168.1.5:9000/auth/local";
 
        	return $http.post(link, {email : email , password: password});
		},

		authFacebook : function(){

			     var link = ConfigService.getHost() +'/auth/facebook';
 
        	return $http.get(link);
		},

		authSingUp : function(email, password, name){
				 var link = ConfigService.getHost() +'/auth/local/singup';

			return $http.post(link , {email : email , password: password , name: name});
		},

		getUserInfo : function(){
				 var link = ConfigService.getHost() +'/api/users/me';
				 var jwt = $window.localStorage['token'];

			return $http.get(link,{headers: {'Authorization': 'Bearer ' + $window.localStorage['token']}});
		}
	};

	return service;

}])

.factory('backButtonOverride', function ($rootScope, $ionicPlatform) {
    var results = {};

    function _setup($scope, customBackFunction) {
        // override soft back
        // framework calls $rootScope.$ionicGoBack when soft back button is pressed
        var oldSoftBack = $rootScope.$ionicGoBack;
        $rootScope.$ionicGoBack = function() {
            customBackFunction();
        };
        var deregisterSoftBack = function() {
            $rootScope.$ionicGoBack = oldSoftBack;
        };

        // override hard back
        // registerBackButtonAction() returns a function which can be used to deregister it
        var deregisterHardBack = $ionicPlatform.registerBackButtonAction(
            customBackFunction, 101
        );

        // cancel custom back behaviour
        $scope.$on('$destroy', function() {
            deregisterHardBack();
            deregisterSoftBack();
        });
    }

    results.setup = _setup;
    return results;
});


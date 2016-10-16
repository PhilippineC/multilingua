appCtrl.controller('LoginCtrl', function($scope, $state, $ionicPlatform) {
    var storage = firebase.storage();
    var logoReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/logo/logo.jpg');
    logoReference.getDownloadURL().then(function (src) {
        $ionicPlatform.ready(function () {
            $scope.logo = src;
            $scope.$apply();
        })
    });

    $scope.login = function(data) {
        var email = data.email;
        var password = data.password;
        firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
            //Success callback
            console.log('Authentication successful', user.uid);
            $state.go('tab.cours');
        }, function (error) {
            //Failure callback
            console.log(error);
            alert("Authentification failed : " + error.message + "Please do it again.");
        });
    }
});
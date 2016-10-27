appCtrl.controller('LoginCtrl', function($ionicPopup, $scope, $state, $ionicPlatform, $firebaseAuth, storageService) {
    storageService.getLogo(function(src) {
        $scope.logo = src;
        $scope.$apply();
    });

    $scope.login = function(data) {
        var email = data.email;
        var password = data.password;
        $scope.authObj = $firebaseAuth();
        $scope.authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $state.go('tab.cours');
        }).catch(function(error) {
            alert("Authentification failed : " + error.message + "Please do it again.");
            console.error("Authentication failed:", error);
        });
    }
});
appCtrl.controller('CoursCtrl', function($scope, profilesService, $state, $ionicPlatform, $ionicLoading, $firebaseAuth) {
    $scope.langues = [];
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            /*  var user = DATABASE.getDataUser(user.uid);*/
            $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner>',
                duration : 1000
            });
            profilesService.getDataUserLanguesDispo(user.uid, function(languesDispo) {
                $scope.langues = languesDispo;
                $scope.$apply();
            });
        }
        else {
            $state.go("login");
        }
    })
});
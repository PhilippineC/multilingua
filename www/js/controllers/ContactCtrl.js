appCtrl.controller('ContactCtrl', function($scope, responsablesService, $ionicLoading, $state, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner>',
                duration : 1000
            });
            responsablesService.getResponsables(function(responsables) {
                $scope.responsables = responsables;
                $scope.$apply();
            });

            /* gestion de l'appel */
            $scope.phone = function(num){
                var call = "tel:" + num;
                document.location.href = call;
            };
        }
        else {
            $state.go("login");
        }
    })
});

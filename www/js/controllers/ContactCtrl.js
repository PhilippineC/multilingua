appCtrl.controller('ContactCtrl', function($scope, RESPONSABLES, $ionicLoading, $ionicPlatform, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner>',
                duration : 1000
            });
            RESPONSABLES.getResponsables(function(responsables) {
                $scope.responsables = responsables;
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

appCtrl.controller('ParamCtrl', function($scope, $state, profilesService, $ionicPopup, $ionicLoading, $ionicHistory, $firebaseAuth, $timeout) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            $scope.user = profilesService.getDataUser(user.uid);

             profilesService.getRefNotifActiveDefaut(user.uid, function(boolNotif) {
                 $scope.notifDefaut = {checked : boolNotif};
             });

            $scope.notifDefautChange = function() {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Notifications par défaut',
                    template: 'Êtes vous sur de vouloir modifier toutes vos notifications ?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        profilesService.changeNotifDefaut(user.uid, $scope.notifDefaut.checked, function(notif) {
                            $scope.notifDefaut.checked = !$scope.notifDefaut.checked;
                        });
                    }
                    else {
                        $scope.notifDefaut.checked = !$scope.notifDefaut.checked;
                    }
                });
            };

            $scope.deconnection = function () {
                $ionicLoading.show({template: 'Déconnexion....'});
                $scope.authObj.$signOut().then(function () {
                    console.log('Sign-out success');
                    $timeout(function () {
                        $ionicLoading.hide();
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        $state.go("login");
                    }, 1000);
                });
            };

            $scope.myGoBack = function () {
                $ionicHistory.goBack();
            };

        } else {
            $state.go("login");
        }
    })
});
appCtrl.controller('AgendaLangueCtrl', function($scope, $stateParams, profilesService, $state, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            profilesService.getRefNotifActiveAgenda(user.uid, $stateParams.langueId, function(dates) {
                $scope.dates = dates;
            });

            $scope.pushNotificationChange = function (date_en_cours) {
                profilesService.changeRefNotifActiveAgenda(user.uid, date_en_cours, $stateParams.langueId);
            };
        }
        else {
            $state.go("login");
        }
    })
});
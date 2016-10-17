appCtrl.controller('AgendaLangueCtrl', function($scope, $stateParams, LANGUES, PROFILE, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            PROFILE.getRefNotifActiveAgenda(user.uid, $stateParams.langueId, function(dates) {
                $scope.dates = dates;
            });

            $scope.pushNotificationChange = function (date_en_cours) {
                PROFILE.changeRefNotifActiveAgenda(user.uid, date_en_cours, $stateParams.langueId);
            };

        }
        else {
            $state.go("login");
        }
    })
});
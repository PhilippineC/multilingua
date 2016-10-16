appCtrl.controller('CoursExerciceFinCtrl', function($scope, LANGUES, $stateParams, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var langue = LANGUES.getLangue($stateParams.langueId);
            langue.$loaded(function() {
                $scope.langue = langue;
                var lecon = LANGUES.getLecon($stateParams.langueId, $stateParams.leconId);
                lecon.$loaded(function () {
                    $scope.lecon = lecon;
                })
            })
        }
        else {
            $state.go('login');
        }
    })
});
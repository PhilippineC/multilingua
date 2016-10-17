appCtrl.controller('CoursExerciceFinCtrl', function($scope, LANGUES, $stateParams, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            LANGUES.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });

            LANGUES.getLecon($stateParams.langueId, $stateParams.leconId, function(lecon) {
                $scope.lecon = lecon;
            });
        }
        else {
            $state.go('login');
        }
    })
});
app.controller('CoursExerciceFinCtrl', function($scope, DATABASE, $stateParams, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var langue = DATABASE.getLangue($stateParams.langueId);
            langue.$loaded(function() {
                $scope.langue = langue;
                var lecon = DATABASE.getLecon($stateParams.langueId, $stateParams.leconId);
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
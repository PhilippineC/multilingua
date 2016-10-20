appCtrl.controller('CoursExerciceFinCtrl', function($scope, languesService, $stateParams, $state, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            languesService.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });

            languesService.getLecon($stateParams.langueId, $stateParams.leconId, function(lecon) {
                $scope.lecon = lecon;
            });
        }
        else {
            $state.go('login');
        }
    })
});
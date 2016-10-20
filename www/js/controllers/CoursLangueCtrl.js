appCtrl.controller('CoursLangueCtrl', function($scope, $stateParams, languesService, profilesService, $state, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            languesService.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });
            profilesService.getLeconsTerm(user.uid, $stateParams.langueId, function (lecons) {
                $scope.cours = lecons;
            });
        } else {
            $state.go("login");
        }
    })
});
appCtrl.controller('CoursLangueCtrl', function($scope, $stateParams, LANGUES, PROFILE, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            LANGUES.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });
            PROFILE.getLeconsTerm(user.uid, $stateParams.langueId, function (lecons) {
                $scope.cours = lecons;
            });
        } else {
            $state.go("login");
        }
    })
});
app.controller('CoursLangueCtrl', function($scope, $stateParams, DATABASE, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var langue = DATABASE.getLangue($stateParams.langueId);
            langue.$loaded(function() {
                $scope.langue = langue;
                var allCours = langue.cours;
                var refCoursTerm = DATABASE.getRefCoursTerm(user.uid);
                refCoursTerm.on('value', function (snapshot) {
                    $scope.cours = [];
                    angular.forEach(allCours, function (lecon) {
                        lecon.termine = false;
                        snapshot.forEach(function (childSnapshot) {
                            if (childSnapshot.val() == lecon.id) {
                                lecon.termine = true;
                            }
                        });
                        $scope.cours.push(lecon);
                    });
                })
            });
        } else {
            $state.go("login");
        }
    })
});
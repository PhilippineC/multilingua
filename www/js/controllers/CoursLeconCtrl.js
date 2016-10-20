appCtrl.controller('CoursLeconCtrl', function($scope, $ionicPlatform, $cordovaMedia, $stateParams, languesService, storageService, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            languesService.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });

            languesService.getLecon($stateParams.langueId, $stateParams.leconId, function(lecon) {
                console.log(lecon);
                $scope.lecon = lecon;
                $scope.leconEnCoursId = lecon.id;
                /* Gestion des médias */
                if (lecon.audio) {
                    storageService.getAudio(lecon.id, function(src) {
                        $ionicPlatform.ready(function () {
                            var media = $cordovaMedia.newMedia(src);
                            $scope.playMedia = function () {
                                media.play();
                            };
                            $scope.pauseMedia = function () {
                                media.pause();
                            };
                            $scope.stopMedia = function () {
                                media.stop();
                            };
                            $scope.$on('destroy', function () {
                                media.release();
                            });
                        });
                    });
                }
            });
            languesService.getChapitres($stateParams.langueId, $stateParams.leconId, function(chapitres) {
                $scope.chapitres = chapitres;
            });

            /* Gestion du contenu texte sous forme d'accordéon */
            $scope.toggleGroup = function (item) {
                if ($scope.isGroupShown(item)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = item;
                }
            };
            $scope.isGroupShown = function (item) {
                return $scope.shownGroup === item;
            };

            /* Lancement du 1er exercice après avoir lu/écouté la leçon */
            $scope.exercice = 1;
            $scope.exEnCours = 1;
        } else {
            $state.go("login");
        }
    })
});
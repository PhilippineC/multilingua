appCtrl.controller('CoursLeconCtrl', function($scope, $ionicPlatform, $cordovaMedia, $stateParams, LANGUES) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            LANGUES.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });

            LANGUES.getLecon($stateParams.langueId, $stateParams.leconId, function(lecon) {
                $scope.lecon = lecon;
                $scope.leconEnCoursId = lecon.id;
            });
            LANGUES.getChapitres($stateParams.langueId, $stateParams.leconId, function(chapitres) {
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

            /* Gestion des médias */
            if (lecon.audio) {
                var storage = firebase.storage();
                var audioReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/cours_audio/Cours' + lecon.id + '.mp3');
                audioReference.getDownloadURL().then(function (src) {
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
                }).catch(function (error) {
                    console.log(error)
                });
            }
            /* Lancement du 1er exercice après avoir lu/écouté la leçon */
            $scope.exercice = 1;
            $scope.exEnCours = 1;
        } else {
            $state.go("login");
        }
    })
});
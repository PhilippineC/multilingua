appCtrl.controller('CoursExerciceCtrl', function($scope, languesService, profilesService, $stateParams, $firebaseAuth, $timeout, $state, constantesService) {
    $scope.authObj = $firebaseAuth();
    $scope.authObj.$onAuthStateChanged(function(user) {
        if (user) {
            var exercice = null;
            languesService.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });
            languesService.getLecon($stateParams.langueId, $stateParams.leconId, function(lecon) {
                $scope.lecon = lecon;
            });
            languesService.getLecon($stateParams.langueId, $stateParams.leconEnCoursId, function(lecon_en_cours) {
                $scope.leconEnCours = lecon_en_cours;
            });
            languesService.getExercices($stateParams.langueId, $stateParams.leconId, function(exercices) {
                $scope.exercices = exercices;
                for (var j=0; j<exercices.length; j++) {
                    if (exercices[j].id == $stateParams.exerciceId) {
                        exercice = exercices[j];
                        $scope.exercice = exercice;
                    }
                }
                var propositions = exercice.propositions;
                $scope.propositions = [];
                for (var i = 0; i<propositions.length;i++) {
                    var proposition = {};
                    proposition.libelle = propositions[i];
                    proposition.success = false;
                    proposition.wrong = false;
                    $scope.propositions.push(proposition);
                }
            });
            $scope.exNum = parseInt($stateParams.exEnCours);

            $scope.clickReponse = function (proposition) {
                if (proposition.libelle == exercice.reponse) {
                    proposition.success = true;
                    proposition.wrong = false;
                    $timeout(
                        function () {
                            var suite = true;
                            var nextEx = exercice.id + 1;
                            var exEnCours = parseInt($stateParams.exEnCours) + 1;
                            if (exEnCours > (constantesService.NBEXS + constantesService.NBEXS_SUPP)) { // Exercices terminés
                                profilesService.getDataUserCoursTerm(user.uid, function(CoursTerm) {
                                    for (var i =0; i<CoursTerm.length; i++) {
                                        if (CoursTerm[i] == $stateParams.leconEnCoursId) {
                                            suite = false;
                                        }
                                    }
                                    if (suite) {
                                        profilesService.pushNewCoursTerm(user.uid, $stateParams.leconEnCoursId);
                                    }
                                    $state.go("tab.cours-exercice-fin", {
                                        langueId: $stateParams.langueId,
                                        leconId: $stateParams.leconEnCoursId
                                    });
                                });
                            }
                            else if (exEnCours > constantesService.NBEXS) { //on rajoute 3 ex cherché aléatoirement dans les lecons déjà terminées
                                profilesService.getDataUserCoursTerm(user.uid, function(CoursTerm) {
                                    if (CoursTerm.length == 0) { // dans le cas où c'est la première leçon terminée on s'arrête là
                                        profilesService.pushNewCoursTerm(user.uid, $stateParams.leconEnCoursId);
                                        $state.go("tab.cours-exercice-fin", {
                                            langueId: $stateParams.langueId,
                                            leconId: $stateParams.leconEnCoursId
                                        });
                                    }
                                    else {
                                        var alea = Math.floor(Math.random() * CoursTerm.length); // indice aléatoire dans le tableau
                                        var leconAleaId = CoursTerm[alea].$value;
                                        languesService.getExercices($stateParams.langueId, leconAleaId, function(exercices) {
                                            var exAleaId = Math.floor(Math.random() * exercices.length) + 1;
                                            $state.go("tab.cours-exercice", {
                                                langueId: $stateParams.langueId,
                                                leconId: leconAleaId,
                                                exerciceId: exAleaId,
                                                leconEnCoursId: $stateParams.leconEnCoursId,
                                                exEnCours: exEnCours
                                            });
                                        });
                                    }
                                });
                            }
                            else {
                                $state.go("tab.cours-exercice", {
                                    langueId: $stateParams.langueId,
                                    leconId: $stateParams.leconId,
                                    exerciceId: nextEx,
                                    leconEnCoursId: $stateParams.leconEnCoursId,
                                    exEnCours: exEnCours
                                });
                            }
                        }, 1500);
                }
                else {
                    proposition.success = false;
                    proposition.wrong = true;
                    $timeout(
                        function () {
                            angular.forEach(proposition, function () {
                                proposition.success = false;
                                proposition.wrong = false;
                            });
                        }, 1500);
                }
            }
        } else {
            $state.go('login');
        }
    })
});
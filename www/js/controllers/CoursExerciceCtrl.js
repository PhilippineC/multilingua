appCtrl.controller('CoursExerciceCtrl', function($scope, LANGUES, PROFILE, $stateParams, $timeout, $state, CONSTANTES) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var exercice = null;
            LANGUES.getLangue($stateParams.langueId, function(langue) {
                $scope.langue = langue;
            });
            LANGUES.getLecon($stateParams.langueId, $stateParams.leconId, function(lecon) {
                $scope.lecon = lecon;
            });
            LANGUES.getLecon($stateParams.langueId, $stateParams.leconEnCoursId, function(lecon_en_cours) {
                $scope.leconEnCours = lecon_en_cours;
            });
            LANGUES.getExercices($stateParams.langueId, $stateParams.leconId, function(exercices) {
                $scope.exercices = exercices;
                angular.forEach(exercices, function (exercice_en_cours) {
                    console.log(exercice_en_cours);
                    if (exercice_en_cours.id == $stateParams.exerciceId) {
                        exercice = exercice_en_cours;
                        $scope.exercice = exercice;
                    }
                });
                var propositions = exercice.propositions; // Aller chercher les prop avec service ?
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
                            var ref = PROFILE.getRefCoursTerm(user.uid);
                            var suite = true;
                            var nextEx = exercice.id + 1;
                            var exEnCours = parseInt($stateParams.exEnCours) + 1;
                            if (exEnCours > (CONSTANTES.NBEXS + CONSTANTES.NBEXS_SUPP)) {
                                ref.on('value', function (snapshot) {
                                    snapshot.forEach(function (childSnapshot) {
                                        if (childSnapshot.val() == leconEnCours.id) {
                                            suite = false;
                                        }
                                    });
                                    if (suite) {
                                        var newLeconTerm = ref.push();
                                        newLeconTerm.set(leconEnCours.id);
                                    }
                                    $state.go("tab.cours-exercice-fin", {
                                        langueId: langue.id,
                                        leconId: leconEnCours.id
                                    });
                                });
                            }
                            else if (exEnCours > CONSTANTES.NBEXS) { //on rajoute 3 ex cherché aléatoirement dans les lecons déjà terminées
                                ref.once('value', function (snapshot) {
                                    if (snapshot.val() == null) { // dans le cas où c'est la première leçon terminée on s'arrête là
                                        var newLeconTerm = ref.push();
                                        newLeconTerm.set(leconEnCours.id);
                                        $state.go("tab.cours-exercice-fin", {
                                            langueId: langue.id,
                                            leconId: leconEnCours.id
                                        });
                                    }
                                    else {
                                        var leconAleaId = leconEnCours.id;
                                        while (leconAleaId == leconEnCours.id) {
                                            var alea = Math.floor(Math.random() * Object.keys(snapshot.val()).length);
                                            var i = 0;
                                            snapshot.forEach(function (childSnapshot) {
                                                if (i == alea) {
                                                    leconAleaId = childSnapshot.val();
                                                }
                                                i++;
                                            });
                                        }
                                        LANGUES.getLecon($stateParams.langueId, leconAleaId, function(leconAlea) {
                                            var exAleaId = Math.floor(Math.random() * (Object.keys(leconAlea.exercices)).length) + 1;
                                            $state.go("tab.cours-exercice", {
                                                langueId: langue.id,
                                                leconId: leconAleaId,
                                                exerciceId: exAleaId,
                                                leconEnCoursId: leconEnCours.id,
                                                exEnCours: exEnCours
                                            });
                                        });
                                    }
                                });
                            }
                            else {
                                $state.go("tab.cours-exercice", {
                                    langueId: langue.id,
                                    leconId: lecon.id,
                                    exerciceId: nextEx,
                                    leconEnCoursId: leconEnCours.id,
                                    exEnCours: exEnCours
                                });
                            }
                        }, 2000);
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
                        }, 2000);
                }
            }
        } else {
            state.go('login');
        }
    })
});
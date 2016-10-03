angular.module('starter.controllers', ["firebase"])

.controller('CoursCtrl', function($scope, DATABASE) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    /*  var user = DATABASE.getDataUser(user.uid);*/
      var langues = DATABASE.all('langues', 'id');
      langues.$loaded(function() {
        var languesDispo = DATABASE.getDataUserLanguesDispo(user.uid);
        languesDispo.$loaded(function() {
          $scope.langues = [];
          angular.forEach(languesDispo, function(langueDispo) {
            angular.forEach(langues, function(langue) {
              if (langueDispo.$value == langue.id) {
                $scope.langues.push(langue);
              }
            })
          });
        })
      });
   } else {
      $state.go("login");
    }
  });
})

.controller('CoursLangueCtrl', function($scope, $stateParams, DATABASE) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var langue = DATABASE.get('langues', $stateParams.langueId);
        $scope.langue = langue;
        var allCours = langue.cours;
        var ref = new Firebase("https://multilingua-d2319.firebaseio.com/profiles/" + user.uid + "/coursTerm");
        ref.on('value', function (snapshot) {
          $scope.cours = [];
          angular.forEach(allCours, function (lecon) {
            snapshot.forEach(function (childSnapshot) {
              if (childSnapshot.val() == lecon.id) {
                lecon.termine = true;
              }
            });
            $scope.cours.push(lecon);
          });
        })
    } else {
      $state.go("login");
    }
  })
})

.controller('CoursLeconCtrl', function($scope, $ionicPlatform, $cordovaMedia, $stateParams, DATABASE) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $scope.langue = DATABASE.get('langues', $stateParams.langueId);
      var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
      $scope.lecon = lecon;

      /* Gestion du contenu texte sous forme d'accordéon */
      $scope.chapitres = lecon.chap;

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
        var audioReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/Cours' + lecon.id + '.mp3');
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
      $scope.leconEnCoursId = lecon.id;

    } else {
      $state.go("login");
    }
  })
})

.controller('CoursExerciceCtrl', function($scope, DATABASE, $stateParams, $timeout, $state, CONSTANTES) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log($stateParams);
      var exercice = null;
      var langue = DATABASE.get('langues', $stateParams.langueId);
      $scope.langue = langue;
      var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
      $scope.lecon = lecon;
      var leconEnCours = DATABASE.getData($stateParams.langueId, $stateParams.leconEnCoursId);
      $scope.leconEnCours = leconEnCours;
      $scope.exNum = parseInt($stateParams.exEnCours);
      var exercices = lecon.exercices;
      console.log((Object.keys(exercices)).length);

      angular.forEach(exercices, function (exercice_en_cours) {
        if (exercice_en_cours.id == $stateParams.exerciceId) {
            exercice = exercice_en_cours;
            $scope.exercice = exercice;
        }
      });
      $scope.propositions = exercice.propositions;
      $scope.clickReponse = function (proposition) {
        if (proposition.libelle == exercice.reponse) {
          proposition.success = true;
          proposition.wrong = false;
          $timeout(
              function () {
                var ref = new Firebase("https://multilingua-d2319.firebaseio.com/profiles/" + user.uid + "/coursTerm");
                var suite = true;
                var nextEx = exercice.id + 1;
                var exEnCours = parseInt($stateParams.exEnCours) + 1;
                if (exEnCours > (CONSTANTES.NBEXS + CONSTANTES.NBEXS_SUPP)) {
                  console.log(CONSTANTES.NBEXS + CONSTANTES.NBEXS_SUPP);
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
                    $state.go("tab.cours-exercice-fin", {langueId: langue.id, leconId: leconEnCours.id});
                  });
                }
                else if (exEnCours > CONSTANTES.NBEXS) { //on rajoute 3 ex cherché aléatoirement dans les lecons déjà terminées
                  console.log(exEnCours);
                  ref.once('value', function (snapshot) {
                    console.log(snapshot.val());
                    if (snapshot.val() == null) { // dans le cas où c'est la première leçon terminée on s'arrête là
                      var newLeconTerm = ref.push();
                      newLeconTerm.set(leconEnCours.id);
                      $state.go("tab.cours-exercice-fin", {langueId: langue.id, leconId: leconEnCours.id});
                    }
                    else {
                      console.log(Object.keys(snapshot.val()).length);
                      var alea = Math.floor(Math.random() * Object.keys(snapshot.val()).length);
                      console.log(alea);
                      var i = 0;
                      snapshot.forEach(function(childSnapshot) {
                        if (i == alea) {
                          var leconAleaId = childSnapshot.val();
                          console.log(leconAleaId);
                          var leconAlea = DATABASE.getData($stateParams.langueId,leconAleaId);
                          console.log(leconAlea);
                          var exAleaId = Math.floor(Math.random() * (Object.keys(leconAlea.exercices)).length)+1;
                          console.log(exAleaId);
                          $state.go("tab.cours-exercice", {langueId: langue.id, leconId: leconAleaId , exerciceId: exAleaId , leconEnCoursId: leconEnCours.id, exEnCours: exEnCours});
                        }
                        i++;
                      });
                    }
                  });
                }
                else {
                  $state.go("tab.cours-exercice", {langueId: langue.id, leconId: lecon.id, exerciceId: nextEx, leconEnCoursId: leconEnCours.id, exEnCours: exEnCours});
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
})

.controller('CoursExerciceFinCtrl', function($scope, DATABASE, $stateParams) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var langue = DATABASE.get('langues', $stateParams.langueId);
      $scope.langue = langue;
      var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
      $scope.lecon = lecon;
      // récuperer l'id du cours et mettre en true dans la BDD utilisateur
    }
    else {
      state.go('login');
    }
  })
})

.controller('AgendaCtrl', function($scope, $firebaseArray, DATABASE) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var ref = new Firebase("https://multilingua-d2319.firebaseio.com");
      var langues = $firebaseArray(ref.child('langues').orderByChild('id'));
      langues.$loaded(function() {
        console.log(langues);
        var languesDispo = $firebaseArray(ref.child('profiles').child(user.uid).child('languesDispo'));
        languesDispo.$loaded(function() {
          console.log(languesDispo);
          $scope.langues = [];
          angular.forEach(languesDispo, function(langueDispo) {
            angular.forEach(langues, function(langue) {
              if (langueDispo.$value == langue.id) {
                $scope.langues.push(langue);
              }
            })
          });
          console.log($scope.langues);
        })
      });
    } else {
      $state.go("login");
    }
  });
})

.controller('AgendaLangueCtrl', function($scope, $stateParams, DATABASE) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var dates_valides = [];
      var data = DATABASE.get('langues', $stateParams.langueId);
      $scope.langue = data;
      var dates = data.datesFormation;
      angular.forEach(dates, function (date_en_cours) {
        var date_format = new Date(date_en_cours.date);
        if (date_format >= new Date()) {
          dates_valides.push(date_en_cours);
        }
      });
      $scope.dates = dates_valides;
      $scope.pushNotificationChange = function() {
        console.log('Push Notification Change', $scope.pushNotification.checked);
      };
      $scope.pushNotification = { checked: true };
    }
    else {
      $state.go("login");
    }
  })
})

.controller('ContactCtrl', function($scope,$firebaseArray, DATABASE, $cordovaEmailComposer, $ionicPlatform) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $scope.responsables = $firebaseArray(new Firebase("https://multilingua-d2319.firebaseio.com/responsables"));

      /* gestion de l'appel */
      $scope.phone = function(num){
        var call = "tel:" + num;
        document.location.href = call;
      };
      /* gestion du mail
       $scope.mailTo = function(mail) {
       $ionicPlatform.ready(function () {
       var email = {
       to: 'mail@mail.com',
       subject: 'Formations Multilingua',
       body: '',
       isHtml: true
       };

       $cordovaEmailComposer.isAvailable().then(function () {
       $cordovaEmailComposer.open(email).then(null, function () {
       // user cancelled email
       });
       }, function () {
       // not available
       alert("service non disponible");
       });
       })
       } */
    }
    else {
      $state.go("login");
    }
  })
})

.controller('LoginCtrl', function($scope, $state) {
  $scope.loginEmail = function() {
    var email = "a@alll.fr";
    var password = "000000";
    console.log(email);
    firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
      //Success callback
      console.log('Authentication successful', user.uid);
      $state.go('tab.cours');
    }, function (error) {
      //Failure callback
      console.log(error);
      alert("Authentification failed : " + error.message + "Please do it again.");
    });
  }
})

.controller('ParamCtrl', function($scope, $state, DATABASE) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    /*  $scope.user = user;*/
      var dataUser = DATABASE.getDataUser(user.uid);

    } else {
      $state.go("login");
    }
  })
});



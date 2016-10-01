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
      var leconsTerm = DATABASE.getDataUserCoursTerm(user.uid) ;
      leconsTerm.$loaded(function() {
        console.log(leconsTerm);
      /*  var alea = Math.floor(Math.random() * leconsTerm.length);
        console.log(alea);
        var leconAleaId = leconsTerm[alea].$value;
        console.log(leconAleaId);
        var leconAlea = DATABASE.getData($stateParams.langueId,parseInt(leconAleaId));
        console.log(leconAlea);
        var exAleaId = Math.floor(Math.random() * (Object.keys(leconAlea.exercices)).length)+1;
        console.log(exAleaId);*/

        var langue = DATABASE.get('langues', $stateParams.langueId);
        var allCours = langue.cours;
        $scope.cours = [];
        angular.forEach(allCours, function (lecon) {
          var ref = new Firebase("https://multilingua-d2319.firebaseio.com/profiles/" + user.uid + "/coursTerm");
          ref.on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              if (childSnapshot.val() == lecon.id) {
                lecon.termine = true;
              }
            });
            $scope.cours.push(lecon);
          });
        })
      })
    } else {
      $state.go("login");
    }
  })
})

.controller('CoursLeconCtrl', function($scope, $ionicPlatform, $cordovaMedia, $stateParams, DATABASE) {
  $scope.langue = DATABASE.get('langues', $stateParams.langueId);
  var lecon = DATABASE.getData($stateParams.langueId,$stateParams.leconId);
  $scope.lecon = lecon;

  /* Gestion du contenu texte sous forme d'accordéon */
  $scope.chapitres = lecon.chap;

  $scope.toggleGroup = function(item) {
    if ($scope.isGroupShown(item)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = item;
    }
  };
  $scope.isGroupShown = function(item) {
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
  $scope.exNum = 1;
})

.controller('CoursExerciceCtrl', function($scope, DATABASE, $stateParams, $timeout, $state) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var exercice = null;
      var langue = DATABASE.get('langues', $stateParams.langueId);
      $scope.langue = langue;
      var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
      $scope.lecon = lecon;
      $scope.exNum = parseInt($stateParams.exNum);
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
                var suite = true;
                var nextEx = exercice.id + 1;
                var exNum = parseInt($stateParams.exNum) + 1;
                console.log(exNum);
                if (exNum > 9) {
                  var coursTerm = DATABASE.getDataUserCoursTerm(user.uid) ;
                  coursTerm.$loaded(function () {
                    coursTerm.forEach(function(term) {
                      if (term.$value == lecon.id) {
                        suite = false;
                      }
                    });
                    if (suite) {
                      var ref =  new Firebase("https://multilingua-d2319.firebaseio.com/profiles/" + user.uid + "/coursTerm");
                      var newLeconTerm = ref.push();
                      newLeconTerm.set(lecon.id);
                     }
                    $state.go("tab.cours-exercice-fin", {langueId: langue.id, leconId: lecon.id});
                  });
                }
                else if (exNum > 5) { //on rajoute 3 ex cherché aléatoirement dans les lecons déjà terminées
                  console.log(exNum);
                  var coursTerm = DATABASE.getDataUserCoursTerm(user.uid);
                  coursTerm.$loaded(function() {
                    console.log(coursTerm);
                    // Attention faire un while (leconAleaId == lecon.id)
                    var alea = Math.floor(Math.random() * coursTerm.length);
                    console.log(alea);
                    console.log(coursTerm[0]);
                    var leconAleaId = coursTerm[alea].$value;
                    console.log(leconAleaId);
                    var leconAlea = DATABASE.getData($stateParams.langueId,leconAleaId);
                    console.log(leconAlea);
                    var exAleaId = Math.floor(Math.random() * (Object.keys(leconAlea.exercices)).length)+1;
                    console.log(exAleaId);
                    $state.go("tab.cours-exercice", {langueId: langue.id, leconId: leconAleaId , exerciceId: exAleaId , exNum: exNum});
                  });
                }
                else {
                  $state.go("tab.cours-exercice", {langueId: langue.id, leconId: lecon.id, exerciceId: nextEx, exNum: exNum});
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
  var langue = DATABASE.get('langues', $stateParams.langueId);
  $scope.langue = langue;
  var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
  $scope.lecon = lecon;
  // récuperer l'id du cours et mettre en true dans la BDD utilisateur
})

.controller('AgendaCtrl', function($scope, DATABASE) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.dataUser = user;
      var profile = DATABASE.getDataUser(user.uid);
      var allLangues = DATABASE.all('langues', 'id');
      var langues = [];
      profile.$loaded()(function() {
      /*  for (var i = 0; i<profile.langueDispo.length; i++) {
          angular.forEach(allLangues, function(langue) {
            if (langue.id == profile.langueDispo[i]) {
              langues.push(langue);
            }
          });
        }*/
        $scope.langues = langues;
      });
    } else {
      $state.go("login");
    }
  });
})

.controller('AgendaLangueCtrl', function($scope, $stateParams, DATABASE) {
  dates_valides = [];
  var data = DATABASE.get('langues', $stateParams.langueId);
  $scope.langue = data;
  var dates = data.datesFormation;
  angular.forEach(dates, function (date_en_cours) {
    date_format = new Date(date_en_cours.date);
    if (date_format >= new Date()) {
      dates_valides.push(date_en_cours);
    }
  });
  $scope.dates = dates_valides;
  $scope.pushNotificationChange = function() {
    console.log('Push Notification Change', $scope.pushNotification.checked);
  };
  $scope.pushNotification = { checked: true };


})

.controller('ContactCtrl', function($scope, DATABASE, $cordovaEmailComposer, $ionicPlatform) {
  $scope.responsables = DATABASE.all('responsables', 'nom');
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
  });
});



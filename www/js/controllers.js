angular.module('starter.controllers', ['firebase', 'ionic.cloud'])

.controller('CoursCtrl', function($scope, DATABASE, $state) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user);
    /*  var user = DATABASE.getDataUser(user.uid);*/
      var langues = DATABASE.getLangues('id');
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

.controller('CoursLangueCtrl', function($scope, $stateParams, DATABASE, $state) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var langue = DATABASE.getLangue($stateParams.langueId);
      langue.$loaded(function() {
        $scope.langue = langue;
        var allCours = langue.cours;
        console.log(allCours);
        var refCoursTerm = DATABASE.getRefCoursTerm(user.uid);
        refCoursTerm.on('value', function (snapshot) {
          $scope.cours = [];
          angular.forEach(allCours, function (lecon) {
            lecon.termine = false;
            snapshot.forEach(function (childSnapshot) {
              console.log(childSnapshot.val());
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
})

.controller('CoursLeconCtrl', function($scope, $ionicPlatform, $cordovaMedia, $stateParams, DATABASE) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var langue = DATABASE.getLangue($stateParams.langueId);
      langue.$loaded(function() {
        $scope.langue = langue;
        var lecon = DATABASE.getLecon($stateParams.langueId, $stateParams.leconId);
        lecon.$loaded(function() {
          $scope.lecon = lecon;
          $scope.chapitres = lecon.chap;
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
        });
      });
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
      var langue = DATABASE.getLangue($stateParams.langueId);
      langue.$loaded(function() {
        $scope.langue = langue;
        var lecon = DATABASE.getLecon($stateParams.langueId, $stateParams.leconId);
        lecon.$loaded(function() {
          $scope.lecon = lecon;
          var leconEnCours = DATABASE.getLecon($stateParams.langueId, $stateParams.leconEnCoursId);
          leconEnCours.$loaded(function() {
            $scope.leconEnCours = leconEnCours;
            $scope.exNum = parseInt($stateParams.exEnCours);
            var exercices = lecon.exercices;
            console.log(exercices);

            angular.forEach(exercices, function (exercice_en_cours) {
              if (exercice_en_cours.id == $stateParams.exerciceId) {
                exercice = exercice_en_cours;
                $scope.exercice = exercice;
              }
            });
            var propositions = exercice.propositions;
            angular.forEach(propositions, function(proposition) {
              proposition.success = false;
              proposition.wrong = false;
            });
            $scope.propositions = propositions;
            $scope.clickReponse = function (proposition) {
              if (proposition.libelle == exercice.reponse) {
                proposition.success = true;
                proposition.wrong = false;
                $timeout(
                    function () {
                      var ref = DATABASE.getRefCoursTerm(user.uid);
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
                            var leconAleaId = leconEnCours.id;
                            while( leconAleaId == leconEnCours.id) {
                              console.log(Object.keys(snapshot.val()).length);
                              var alea = Math.floor(Math.random() * Object.keys(snapshot.val()).length);
                              console.log(alea);
                              var i = 0;
                              snapshot.forEach(function (childSnapshot) {
                                if (i == alea) {
                                  leconAleaId = childSnapshot.val();
                                  console.log(leconAleaId);
                                }
                                i++;
                              });
                            }
                            var leconAlea = DATABASE.getData($stateParams.langueId, leconAleaId);
                            console.log(leconAlea);
                            var exAleaId = Math.floor(Math.random() * (Object.keys(leconAlea.exercices)).length) + 1;
                            console.log(exAleaId);
                            $state.go("tab.cours-exercice", {
                              langueId: langue.id,
                              leconId: leconAleaId,
                              exerciceId: exAleaId,
                              leconEnCoursId: leconEnCours.id,
                              exEnCours: exEnCours
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
          })
        })
      });
    } else {
      state.go('login');
    }
  })
})

.controller('CoursExerciceFinCtrl', function($scope, DATABASE, $stateParams, $state) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var langue = DATABASE.getLangue($stateParams.langueId);
      langue.$loaded(function() {
        $scope.langue = langue;
        var lecon = DATABASE.getLecon($stateParams.langueId, $stateParams.leconId);
        lecon.$loaded(function () {
          $scope.lecon = lecon;
        })
      })
    }
    else {
      $state.go('login');
    }
  })
})

.controller('AgendaCtrl', function($scope, DATABASE, $state) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var langues = DATABASE.getLangues('id');
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

.controller('AgendaLangueCtrl', function($scope, $stateParams, DATABASE, $state) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var ref = DATABASE.getRefNotifActive(user.uid);
      ref.once('value', function (snapshot) {
        var langue = DATABASE.getLangue($stateParams.langueId);
        langue.$loaded(function () {
          $scope.langue = langue;
          var dates = langue.datesFormation;
          $scope.dates = [];
          angular.forEach(dates, function (date_en_cours) { // ou faire une boucle sur $scope.dates
            date_en_cours.checked = false;
            var date_format = new Date(date_en_cours.date);
            var options = {year: "numeric", month: "long", day: "numeric"};
            date_en_cours.dateformat = date_format.toLocaleDateString("fr-FR", options);
            date_en_cours.heure = date_format.toLocaleTimeString("fr-FR");
            if (date_format >= new Date()) {
              if (snapshot.val() == null) { // aucune notif active
                date_en_cours.checked = false;
              }
              else {
                snapshot.forEach(function (childSnapshot) {
                  if (date_en_cours.id == childSnapshot.val()) {
                    date_en_cours.checked = true;
                  }
                })
              }
              $scope.dates.push(date_en_cours);
            }
          });
        });

        $scope.pushNotificationChange = function (date_en_cours) {
          console.log(date_en_cours);
          var suite = true;
          var ref = DATABASE.getRefNotifActive(user.uid);
          ref.once('value', function (snapshot) {
            snapshot.forEach(function (dataSnapshot) {
              switch (date_en_cours.checked) {
                case true :
                  if (dataSnapshot.val() == date_en_cours.id) {
                    suite = false;
                  }
                  break;
                case false :
                  if (dataSnapshot.val() == date_en_cours.id) {
                    ref.child(dataSnapshot.key()).remove();
                    cordova.plugins.notification.local.cancel(date_en_cours.id, function () {
                      console.log('Notif annulée : ' + date_en_cours.id);
                    });
                    suite = false;
                  }
                  break;
              }
            });
            if (suite) {
              var newNotifActive = ref.push();
              newNotifActive.set(date_en_cours.id);
              // ========== Scheduling
              var dateFormation = new Date(date_en_cours.date).getTime();
              console.log('date de formation moins 1h :' + new Date(dateFormation - 3600 * 1000));
              cordova.plugins.notification.local.schedule({
                id: date_en_cours.id,
                text: 'Rappel : formation en ' + $scope.langue.nom + ' dans 1h en ' + date_en_cours.lieu + '.',
                at: new Date(dateFormation - 3600 * 1000) // On retire une heure*/
              })
            }
          })
        };
      });
    }
    else {
      $state.go("login");
    }
  })
})


.controller('ContactCtrl', function($scope,DATABASE, $cordovaEmailComposer, $ionicPlatform, $state) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $scope.responsables = DATABASE.getResponsables();

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
  $scope.login = function() {
    var email = "a@alll.fr";
  /*  var email = $scope.data.email;*/
    var password = "000000";
    /*  var password = $scope.data.password;*/
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

.controller('ParamCtrl', function($scope, $state, DATABASE, $ionicPopup, $ionicLoading, $ionicHistory, $timeout) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user = DATABASE.getDataUser(user.uid);
      var refNotifActive = DATABASE.getRefNotifActive(user.uid);
      var refNotifActiveDefaut = DATABASE.getRefNotifActiveDefaut(user.uid);
      refNotifActive.on('value', function(snapshotNA) {
        refNotifActiveDefaut.on('value', function (snapshot) {
          console.log(snapshot.val());
          $scope.notifDefaut = {checked : snapshot.val()};
          $scope.notifDefautChange = function() {
            var confirmPopup = $ionicPopup.confirm({
              title: 'Notifications par défaut',
              template: 'Êtes vous sur de vouloir modifier toutes vos notifications ?'
            });
            confirmPopup.then(function(res) {
              if(res) {
                refNotifActiveDefaut.set($scope.notifDefaut.checked);
                // Supprimer toutes les notifs initiales
                snapshotNA.forEach(function(dataSnapshotNA) {
                  //On supprime la valeur du tableau pour avoir un tableau vide
                  refNotifActive.child(dataSnapshotNA.key()).remove();
                  //On annule la notification correspondante
                  cordova.plugins.notification.local.cancel(dataSnapshotNA.val(), function () {
                    console.log('Notif annulée : ' + dataSnapshotNA.val());
                  });
                });

                if ($scope.notifDefaut.checked) {
                 // Replir le tableau avec toutes les id des dates des formations des langues dispo
                  var langues = DATABASE.getLangues('id');
                  langues.$loaded(function() {
                    var languesDispo = DATABASE.getDataUserLanguesDispo(user.uid);
                    languesDispo.$loaded(function () {
                      angular.forEach(languesDispo, function (langueDispo) {
                        angular.forEach(langues, function (langue) {
                          console.log(langue);
                          console.log(langueDispo);
                          if (langueDispo.$value == langue.id) {
                            var datesForm = langue.datesFormation;
                            angular.forEach(datesForm, function(dateForm) {
                              if ((new Date(dateForm.date)) >= new Date()) { // Si la date de formation est plus tard qu'aujourd'hui
                                var newdateID = refNotifActive.push();
                                newdateID.set(dateForm.id);
                                // Nouvelle notif créer
                                cordova.plugins.notification.local.schedule({
                                  id: dateForm.id,
                                  text: 'Rappel : formation en ' + langue.nom + ' dans 1h en ' + dateForm.lieu + '.',
                                  at: new Date(new Date(dateForm.date).getTime() - 3600 * 1000) // On retire une heure*/
                                })
                              }
                            })
                          }
                        })
                      })
                    })
                  });
                 }
              }
              else {
                $scope.notifDefaut.checked = !$scope.notifDefaut.checked;
              }
            });
          };
        });
      });
      $scope.deconnection = function() {
        $ionicLoading.show({template:'Deconnection....'});
      /*  $localstorage.set('loggin_state', '');*/
        firebase.auth().signOut();
        $timeout(function () {
          $ionicLoading.hide();
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
          $ionicHistory.nextViewOptions({ disableBack: false, historyRoot: true });
          $state.go("login");
        }, 2000);
      };

      $scope.myGoBack = function() {
        $ionicHistory.goBack();
      };
    } else {
      $state.go("login");
    }
  })
});



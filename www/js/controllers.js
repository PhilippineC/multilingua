angular.module('starter.controllers', ["firebase"])

.controller('CoursCtrl', function($scope, DATABASE) {
  $scope.langues = DATABASE.all('langues', 'id');
})

.controller('CoursLangueCtrl', function($scope, $stateParams, DATABASE) {
  var data = DATABASE.get('langues', $stateParams.langueId);
  $scope.langue = data;
  $scope.cours = data.cours;
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
  $ionicPlatform.ready(function() {
    var src = lecon.src;
    if(ionic.Platform.isAndroid()){
      src = "/android_asset/www" + src;
    }
    var media = $cordovaMedia.newMedia(src);
    $scope.playMedia = function() {
      media.play();
    };
    $scope.pauseMedia = function() {
      media.pause();
    };
    $scope.stopMedia = function() {
      media.stop();
    };
    $scope.$on('destroy', function() {
      media.release();
    });
  });

  /* Lancement du 1er exercice après avoir lu/écouté la leçon */
  $scope.exercice = 1;
})

.controller('CoursExerciceCtrl', function($scope, DATABASE, $stateParams, $timeout, $state) {
  var exercice = null;
  var langue = DATABASE.get('langues', $stateParams.langueId);
  $scope.langue = langue;
  var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
  $scope.lecon = lecon;
  var exercices = lecon.exercices;

  angular.forEach(exercices, function (exercice_en_cours) {
    if (exercice_en_cours.id == $stateParams.exerciceId) {
      exercice = exercice_en_cours;
      $scope.exercice = exercice;
    }
  });
  $scope.propositions = exercice.propositions;
  $scope.clickReponse = function (proposition) {
    if (proposition.libelle == exercice.reponse) {
      $timeout(
          function () {
            proposition.success = true;
            proposition.wrong = false;
            var nextEx = exercice.id + 1;
            if (nextEx > 5) {
              $state.go("tab.cours-exercice-fin", {langueId: langue.id, leconId: lecon.id})
            }
            else {
              console.log(langue.id);
              console.log(lecon.id);
              $state.go("tab.cours-exercice", {langueId: langue.id, leconId: lecon.id, exerciceId: nextEx});
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

.controller('CoursExerciceFinCtrl', function($scope, DATABASE, $stateParams) {
  var langue = DATABASE.get('langues', $stateParams.langueId);
  $scope.langue = langue;
  var lecon = DATABASE.getData($stateParams.langueId, $stateParams.leconId);
  $scope.lecon = lecon;
  // récuperer l'id du cours et mettre en true dans la BDD utilisateur
})

.controller('AgendaCtrl', function($scope, DATABASE) {
  $scope.langues = DATABASE.all('langues', 'id');
})

.controller('AgendaLangueCtrl', function($scope, $stateParams, DATABASE) {
  var data = DATABASE.get('langues', $stateParams.langueId);
  $scope.langue = data;
  var dates = data.datesFormation;
  $scope.dates = dates;
  angular.forEach(dates, function(val) {
    var date_format = new Date(val.date);
    console.log(date_format);
    if (date_format < new Date()) {
        console.log("date dépassée");
        //Comment supprimer de la scope un objet de l'objet dates ?
      }
    });



  $scope.pushNotificationChange = function() {
    console.log('Push Notification Change', $scope.pushNotification.checked);
  };

  $scope.pushNotification = { checked: true };
})

.controller('ContactCtrl', function($scope, DATABASE) {

  $scope.responsables = DATABASE.all('responsables', 'nom');

  $scope.phone = function(num){
    var call = "tel:" + num;
    alert('Calling ' + call ); //Alert notification is displayed on mobile, so function is triggered correctly!
    document.location.href = call;
  };

  $scope.mailTo = function(mail){
    var mailTo = "mailto:" + mail + "@multilingua.com?subject=Contact&body=message%20goes%20here";
    window.location.href = mailTo;
  }

});

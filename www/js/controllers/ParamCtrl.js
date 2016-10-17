appCtrl.controller('ParamCtrl', function($scope, $state, LANGUES, PROFILE, NOTIFICATIONS, $ionicPopup, $ionicLoading, $ionicHistory, $timeout) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $scope.user = PROFILE.getDataUser(user.uid);
            var refNotifActive = PROFILE.getRefNotifActive(user.uid);
            var refNotifActiveDefaut = PROFILE.getRefNotifActiveDefaut(user.uid);
            refNotifActive.on('value', function(snapshotNA) {
                refNotifActiveDefaut.on('value', function (snapshot) {
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
                                    NOTIFICATIONS.cancelNotif(dataSnapshotNA.val());
                                });

                                if ($scope.notifDefaut.checked) {
                                    // Replir le tableau avec toutes les id des dates des formations des langues dispo
                                    var langues = LANGUES.getLangues('id');
                                    langues.$loaded(function() {
                                        var languesDispo = PROFILE.getDataUserLanguesDispo(user.uid);
                                        languesDispo.$loaded(function () {
                                            angular.forEach(languesDispo, function (langueDispo) {
                                                angular.forEach(langues, function (langue) {
                                                    if (langueDispo.$value == langue.id) {
                                                        var datesForm = langue.datesFormation;
                                                        angular.forEach(datesForm, function(dateForm) {
                                                            if ((new Date(dateForm.date)) >= new Date()) { // Si la date de formation est plus tard qu'aujourd'hui
                                                                var newdateID = refNotifActive.push();
                                                                newdateID.set(dateForm.id);
                                                                // Nouvelle notif créer
                                                                var dateFormation = new Date(dateForm.date).getTime();
                                                                NOTIFICATIONS.pushNotif(dateForm.id, langue.nom, dateForm.heure, dateForm.lieu, dateFormation);
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
                $ionicLoading.show({template:'Déconnexion....'});
                /*  $localstorage.set('loggin_state', '');*/
                firebase.auth().signOut().then(function() {
                    console.log('Sign-out success');
                    $timeout(function () {
                        $ionicLoading.hide();
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        $state.go("login");
                    }, 2000);
                });
            };

            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
        } else {
            $state.go("login");
        }
    })
});
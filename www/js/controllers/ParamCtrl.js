app.controller('ParamCtrl', function($scope, $state, DATABASE, $ionicPopup, $ionicLoading, $ionicHistory, $timeout) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $scope.user = DATABASE.getDataUser(user.uid);
            var refNotifActive = DATABASE.getRefNotifActive(user.uid);
            var refNotifActiveDefaut = DATABASE.getRefNotifActiveDefaut(user.uid);
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
                                    cordova.plugins.notification.local.cancel(dataSnapshotNA.val(), function () {
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
appCtrl.controller('AgendaLangueCtrl', function($scope, $stateParams, LANGUES, PROFILE, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var ref = PROFILE.getRefNotifActive(user.uid);
            ref.on('value', function (snapshot) {
                var langue = LANGUES.getLangue($stateParams.langueId);
                langue.$loaded(function () {
                    $scope.langue = langue;
                    var dates = LANGUES.getDatesFormation($stateParams.langueId);
                    dates.$loaded(function() {
                        $scope.dates = [];
                        angular.forEach(dates, function (date_en_cours) { // ou faire une boucle sur $scope.dates
                            date_en_cours.checked = false;
                            var date_format = new Date(date_en_cours.date);
                            var options = {year: "numeric", month: "long", day: "numeric"};
                            date_en_cours.dateformat = date_format.toLocaleDateString("fr-FR", options);
                            date_en_cours.heure = date_format.toLocaleTimeString("fr-FR" , {hour: "2-digit", minute: "2-digit"});
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
                    })
                });

                $scope.pushNotificationChange = function (date_en_cours) {
                    var suite = true;
                    var ref = PROFILE.getRefNotifActive(user.uid);
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
                            cordova.plugins.notification.local.schedule({
                                id: date_en_cours.id,
                                text: 'Rappel formation : ' + $scope.langue.nom + ' à ' + date_en_cours.heure + ' en ' + date_en_cours.lieu + '.',
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
});
appServices

    .factory('PROFILE', function($firebaseArray, $firebaseObject, LANGUES, NOTIFICATIONS, STORAGE, $ionicPlatform) {
        var refProfiles = new Firebase("https://multilingua-d2319.firebaseio.com/profiles");
        return {
            getRefCoursTerm : function(uid) {
                return refProfiles.child(uid).child('coursTerm');
            },

            getRefNotifActiveAgenda : function(uid, langueId, callback) {
                var ref = refProfiles.child(uid).child('notifActive');
                ref.on('value', function (snapshot) {
                    LANGUES.getDatesFormation(langueId, function(dates) {
                        var datesReturn = [];
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
                                datesReturn.push(date_en_cours);
                            }
                        });
                        callback(datesReturn);
                    });
                })

            },

            changeRefNotifActiveAgenda : function(uid, date_en_cours, langueId) {
                var suite = true;
                LANGUES.getLangue(langueId, function(langue) {
                    var ref = refProfiles.child(uid).child('notifActive');
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
                                        NOTIFICATIONS.cancelNotif(date_en_cours.id);
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
                            NOTIFICATIONS.pushNotif(date_en_cours.id, langue.nom, date_en_cours.heure, date_en_cours.lieu, dateFormation);
                        }
                    })
                });

            },
            getRefNotifActive : function(uid) {
                return refProfiles.child(uid).child('notifActive');
            },

            getRefNotifActiveDefaut : function(uid) {
                return refProfiles.child(uid).child('notifActiveDefaut');
            },

            getDataUser : function(uid) {
                return $firebaseObject(refProfiles.child(uid));
            },

            getDataUserLanguesDispo : function(uid, callback) { //utilisé
                var languesDispo = $firebaseArray(refProfiles.child(uid).child('languesDispo'));
                languesDispo.$loaded(function() {
                    LANGUES.getLangues(function(langues) {
                        var scopeLangues = [];
                        angular.forEach(languesDispo, function(langueDispo) {
                            angular.forEach(langues, function(langue) {
                                if (langueDispo.$value == langue.id) {
                                    STORAGE.getDrapeau(langue.nom, function(src) {
                                        langue.drapeau = src;
                                    });
                                    scopeLangues.push(langue);
                                    console.log(scopeLangues);
                                }
                            });
                        });
                        console.log(scopeLangues);
                        callback(scopeLangues);
                    });
                })
            },

            getDataUserCoursTerm : function(uid) {
                return $firebaseArray(refProfiles.child(uid).child('coursTerm'));
            },

            getDataUserNotif : function(uid) {
                var data = refProfiles.child(uid).child('notifActive');
                return $firebaseArray(data);
            },

            getLeconsTerm : function(uid, langueId, callback) {
                LANGUES.getLangue(langueId, function(langue) {
                    var refCoursTerm = refProfiles.child(uid).child('coursTerm');
                    var allCours = langue.cours;
                    refCoursTerm.on('value', function (snapshot) {
                        var cours = [];
                        angular.forEach(allCours, function (lecon) {
                            lecon.termine = false;
                            snapshot.forEach(function (childSnapshot) {
                                if (childSnapshot.val() == lecon.id) {
                                    lecon.termine = true;
                                }
                            });
                            cours.push(lecon);
                        });
                        callback(cours);
                    })
                });
            }
        };
    });


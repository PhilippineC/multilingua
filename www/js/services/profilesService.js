appServices
    .factory('profilesService', function($firebaseArray, $firebaseObject, languesService, notificationsService, storageService) {
        var refProfiles = firebase.database().ref('profiles');
        return {
            getRefCoursTerm : function(uid) {
                return refProfiles.child(uid).child('coursTerm');
            },
            pushNewCoursTerm : function(uid, CoursTermId) {
                var ref = refProfiles.child(uid).child('coursTerm');
                var newLeconTerm = ref.push();
                newLeconTerm.set(CoursTermId);
            },

            getRefNotifActiveAgenda : function(uid, langueId, callback) {
                var ref = refProfiles.child(uid).child('notifActive');
                ref.on('value', function (snapshot) {
                    languesService.getDatesFormation(langueId, function(dates) {
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
                languesService.getLangue(langueId, function(langue) {
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
                                        ref.child(dataSnapshot.key).remove();
                                        notificationsService.cancelNotif(date_en_cours.id);
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
                            notificationsService.pushNotif(date_en_cours.id, langue.nom, date_en_cours.heure, date_en_cours.lieu, dateFormation);
                        }
                    })
                });

            },
            getRefNotifActive : function(uid) {
                return refProfiles.child(uid).child('notifActive');
            },

            getRefNotifActiveDefaut : function(uid, callback) {
                var refNotifActiveDefaut = refProfiles.child(uid).child('notifActiveDefaut');
                refNotifActiveDefaut.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
            },

            changeNotifDefaut : function(uid, valueNotifDefaut) {
                var refNotifActive = refProfiles.child(uid).child('notifActive');
                var refNotifActiveDefaut = refProfiles.child(uid).child('notifActiveDefaut');
                refNotifActiveDefaut.once('value', function (snapshot) {
                    refNotifActive.once('value', function (snapshotNA) {
                        refNotifActiveDefaut.set(valueNotifDefaut);
                        // Supprimer toutes les notifs initiales
                        snapshotNA.forEach(function (dataSnapshotNA) {
                            //On supprime la valeur du tableau pour avoir un tableau vide
                            refNotifActive.child(dataSnapshotNA.key).remove();
                            //On annule la notification correspondante
                            notificationsService.cancelNotif(dataSnapshotNA.val());
                        });
                    });
                });

                if (valueNotifDefaut) {
                    // Remplir le tableau avec toutes les id des dates des formations des langues dispo
                    var languesDispo = $firebaseArray(refProfiles.child(uid).child('languesDispo'));
                    languesDispo.$loaded(function() {
                        languesService.getLangues(function(langues) {
                            angular.forEach(languesDispo, function(langueDispo) {
                                angular.forEach(langues, function(langue) {
                                    if (langueDispo.$value == langue.id) {
                                        var datesForm = langue.datesFormation;
                                        angular.forEach(datesForm, function (dateForm) {
                                            if ((new Date(dateForm.date)) >= new Date()) { // Si la date de formation est plus tard qu'aujourd'hui
                                                var newdateID = refNotifActive.push();
                                                newdateID.set(dateForm.id);
                                                // Nouvelle notif créer
                                                var dateFormation = new Date(dateForm.date).getTime();
                                                dateForm.heure = (new Date(dateForm.date)).toLocaleTimeString("fr-FR" , {hour: "2-digit", minute: "2-digit"});
                                                notificationsService.pushNotif(dateForm.id, langue.nom, dateForm.heure, dateForm.lieu, dateFormation);
                                            }
                                        })
                                    }
                                });
                            });

                        });
                    });
                }

            },

            getDataUser : function(uid) {
                return $firebaseObject(refProfiles.child(uid));
            },

            getDataUserLanguesDispo : function(uid, callback) { //utilisé
                var languesDispo = $firebaseArray(refProfiles.child(uid).child('languesDispo'));
                languesDispo.$loaded(function() {
                    languesService.getLangues(function(langues) {
                        var scopeLangues = [];
                        var nbLanguesLoad = 0;
                        angular.forEach(languesDispo, function(langueDispo) {
                            angular.forEach(langues, function(langue) {
                                if (langueDispo.$value == langue.id) {
                                    storageService.getDrapeau(langue.nom, function(src) {
                                        langue.drapeau = src;
                                        scopeLangues.push(langue);
                                        nbLanguesLoad++;
                                        if (nbLanguesLoad == languesDispo.length) {
                                            callback(scopeLangues);
                                        }
                                    });
                                }
                            });
                        });
                    });
                })
            },

            getDataUserCoursTerm : function(uid, callback) {
                var data = $firebaseArray(refProfiles.child(uid).child('coursTerm'));
                data.$loaded(function() {
                    callback(data);
                })
            },

            getDataUserNotif : function(uid) {
                var data = refProfiles.child(uid).child('notifActive');
                return $firebaseArray(data);
            },

            getLeconsTerm : function(uid, langueId, callback) {
                languesService.getLangue(langueId, function(langue) {
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
            },
            getLeconDuJour : function(uid, langueId, callback) {
                languesService.getLecons(langueId, function(lecons) {
                    var currDateTimestamp = new Date().getTime();
                    var refDateDerCon = refProfiles.child(uid).child('DateDerCon').child(langueId);
                    refDateDerCon.on("value", function(snapshot) { //changer en on
                        if (snapshot.val() == null) {
                           refDateDerCon.set({
                                currDate : currDateTimestamp,
                                leconDuJour : lecons[0].id
                           });
                            callback(lecons[0]);
                        }

                        else {
                            var refCurrDate = refDateDerCon.child('currDate');
                            refCurrDate.on("value", function(childSnapshot) {
                                var snapshotTimestamp = childSnapshot.val();
                                var jourSnapshot = (new Date(snapshotTimestamp)).getDate();
                                var jourCurrent = (new Date(currDateTimestamp)).getDate();
                                var moisSnapshot = (new Date(snapshotTimestamp)).getMonth();
                                var moisCurrent = (new Date(currDateTimestamp)).getMonth();
                                var anSnapshot = (new Date(snapshotTimestamp)).getFullYear();
                                var anCurrent = (new Date(currDateTimestamp)).getFullYear();
                                // A supprimer après tests
                                var minutesSnapshot = (new Date(snapshotTimestamp)).getMinutes();
                                var minutesCurrent = (new Date(currDateTimestamp)).getMinutes();
                                if((anCurrent > anSnapshot) || (moisCurrent > moisSnapshot) || (jourCurrent >= (jourSnapshot + 1)) || (minutesCurrent > (minutesSnapshot +1))) {// la date de la dernière connection est supérieur à j+1
                                    // On cherche une lecon aléatoire
                                    var alea = 0;
                                    do {alea = Math.floor(Math.random() * lecons.length)} while (alea == 0); // indice aléatoire dans le tableau des lecons
                                    //on met à jour la date et la lecon du jour
                                    var update = {};
                                    update['/currDate'] = currDateTimestamp;
                                    update['/leconDuJour'] = lecons[alea].id;
                                    refDateDerCon.update(update);
                                    //On renvoie la lecon du jour
                                    callback(lecons[alea]);
                                }
                                else { // On reste sur la leçon du jour
                                    var refLecDuJour = refDateDerCon.child('leconDuJour');
                                    refLecDuJour.on("value", function(snapshotLDJ) {
                                        console.log(lecons[snapshotLDJ.val()]);
                                       callback(lecons[snapshotLDJ.val()]);
                                    });
                                }
                            });
                        }
                    });
                });
            }
        };
    });


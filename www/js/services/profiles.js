appServices

    .factory('PROFILE', function($firebaseArray, $firebaseObject, LANGUES, STORAGE, $ionicPlatform) {
        var refProfiles = new Firebase("https://multilingua-d2319.firebaseio.com/profiles");
        return {
            getRefCoursTerm : function(uid) {
                return refProfiles.child(uid).child('coursTerm');
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


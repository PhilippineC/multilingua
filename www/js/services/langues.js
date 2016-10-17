appServices
    .factory('LANGUES', function($firebaseArray, $firebaseObject) {
        var refLangues = new Firebase("https://multilingua-d2319.firebaseio.com/langues");
        return {
            getLangues: function(callback) {
                var data = $firebaseArray(refLangues.orderByChild('id'));
                data.$loaded(function() {
                    callback(data);
                })
            },

            getLangue : function(langueId, callback) {
                var data = $firebaseObject(refLangues.child(langueId));
                data.$loaded(function() {
                    callback(data);
                })
            },

            getDatesFormation: function(langueId, callback) {
                var data = $firebaseArray(refLangues.child(langueId).child('datesFormation').orderByChild('date'));
                data.$loaded(function() {
                    callback(data);
                })
            },

            getLecon : function(langueId, leconId, callback) {
                var lecon = $firebaseObject(refLangues.child(langueId).child('cours').child(leconId));
                lecon.$loaded(function() {
                    callback(lecon);
                })
            },
            getChapitres : function(langueId, leconId, callback) {
                var chapitres = $firebaseObject(refLangues.child(langueId).child('cours').child(leconId).child('chap'));
                chapitres.$loaded(function() {
                    callback(chapitres);
                })
            },
            getExercices : function(langueId, leconId, callback) {
                var exercices = $firebaseObject(refLangues.child(langueId).child('cours').child(leconId).child('exercices'));
                exercices.$loaded(function() {
                    callback(exercices);
                })
            }
        }
    });


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

            getDatesFormation: function(langueId) {
                var data = refLangues.child(langueId).child('datesFormation').orderByChild('date');
                return $firebaseArray(data);
            },

            getLecon : function(langueId, leconId, callback) {
                var lecon = $firebaseObject(refLangues.child(langueId).child('cours').child(leconId));
                var chapitres = lecon.chap;
                callback(lecon, chapitres);
            },
            getChapitres : function(langueId, leconId, callback) {
                var chapitres = $firebaseObject(refLangues.child(langueId).child('cours').child(leconId).child('chap'));
                callback(chapitres);
            }
        }
    });


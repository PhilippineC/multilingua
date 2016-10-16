appServices
    .factory('LANGUES', function($firebaseArray, $firebaseObject) {
        var refLangues = new Firebase("https://multilingua-d2319.firebaseio.com/langues");
        return {
            getLangues: function(orderparam) {
                return $firebaseArray(refLangues.orderByChild(orderparam));
            },

            getLangue : function(langueId) {
                var data = refLangues.child(langueId);
                return $firebaseObject(data);
            },

            getDatesFormation: function(langueId) {
                var data = refLangues.child(langueId).child('datesFormation').orderByChild('date');
                return $firebaseArray(data);
            },

            getLecon : function(langueId, leconId) {
                var data = refLangues.child(langueId).child('cours').child(leconId);
                return $firebaseObject(data);
            }
        }
    });


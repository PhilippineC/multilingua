appServices
    .factory('RESPONSABLES', function($firebaseArray) {
        var refResponsables = new Firebase("https://multilingua-d2319.firebaseio.com/responsables");

        return {
            getResponsables : function() {
                return $firebaseArray(refResponsables);
            }
        };


    });


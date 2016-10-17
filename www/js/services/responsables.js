appServices
    .factory('RESPONSABLES', function($firebaseArray, STORAGE) {
        var refResponsables = new Firebase("https://multilingua-d2319.firebaseio.com/responsables");

        return {
            getResponsables : function(callback) {
                var responsablesReturn = [];
                var responsables = $firebaseArray(refResponsables);
                responsables.$loaded(function() {
                    angular.forEach(responsables, function (responsable) {
                        STORAGE.getAvatar(responsable.img, function(src) {
                            responsable.src = src;
                        });
                        responsablesReturn.push(responsable);
                    });
                    console.log(responsablesReturn);
                    callback(responsablesReturn);
                });
            }
        };
    });


appServices
    .factory('responsablesService', function($firebaseArray, storageService) {
        var refResponsables = firebase.database().ref('responsables');
        return {
            getResponsables : function(callback) {
                var responsablesReturn = [];
                var responsables = $firebaseArray(refResponsables);
                responsables.$loaded(function() {
                    var nbRespLoad = 0;
                    angular.forEach(responsables, function (responsable) {
                        storageService.getAvatar(responsable.img, function(src) {
                            responsable.src = src;
                            responsablesReturn.push(responsable);
                            nbRespLoad++;
                            if (nbRespLoad == responsables.length) {
                                callback(responsablesReturn);
                            }
                        });
                    });
                });
            }
        };
    });


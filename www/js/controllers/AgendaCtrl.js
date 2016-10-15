app.controller('AgendaCtrl', function($scope, DATABASE, $state, $ionicPlatform, $ionicLoading) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var langues = DATABASE.getLangues('id');
            langues.$loaded(function() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner>',
                    duration : 1000
                });
                var languesDispo = DATABASE.getDataUserLanguesDispo(user.uid);
                languesDispo.$loaded(function() {
                    $scope.langues = [];
                    angular.forEach(languesDispo, function(langueDispo) {
                        angular.forEach(langues, function(langue) {
                            if (langueDispo.$value == langue.id) {
                                var storage = firebase.storage();
                                var drapeauReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/drapeau/' + langue.nom + '.jpg');
                                drapeauReference.getDownloadURL().then(function (src) {
                                    $ionicPlatform.ready(function () {
                                        langue.drapeau = src;
                                        $scope.langues.push(langue);
                                        $scope.langues.sort(function(a,b) {
                                            if (a.id > b.id)
                                                return 1;
                                            if (a.id < b.id)
                                                return -1;
                                            else return 0;
                                        });
                                        $scope.$apply();
                                    })
                                }).catch(function (error) {
                                    console.log(error)
                                });
                            }
                        })
                    });
                })
            });
        } else {
            $state.go("login");
        }
    });
});
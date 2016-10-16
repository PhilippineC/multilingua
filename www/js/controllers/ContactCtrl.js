appCtrl.controller('ContactCtrl', function($scope, RESPONSABLES, $ionicLoading, $ionicPlatform, $state) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var responsables = RESPONSABLES.getResponsables();
            responsables.$loaded(function() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner>',
                    duration : 1000
                });
                $scope.responsables = [];
                angular.forEach(responsables, function (responsable) {
                    var storage = firebase.storage();
                    var avatarReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/avatar/' + responsable.img);
                    avatarReference.getDownloadURL().then(function (src) {
                        $ionicPlatform.ready(function () {
                            responsable.src = src;
                            $scope.responsables.push(responsable);
                            $scope.$apply();
                        })
                    }).catch(function (error) {
                        console.log(error);
                    });
                })
            });

            /* gestion de l'appel */
            $scope.phone = function(num){
                var call = "tel:" + num;
                document.location.href = call;
            };
            /* gestion du mail
             $scope.mailTo = function(mail) {
             $ionicPlatform.ready(function () {
             var email = {
             to: 'mail@mail.com',
             subject: 'Formations Multilingua',
             body: '',
             isHtml: true
             };

             $cordovaEmailComposer.isAvailable().then(function () {
             $cordovaEmailComposer.open(email).then(null, function () {
             // user cancelled email
             });
             }, function () {
             // not available
             alert("service non disponible");
             });
             })
             } */
        }
        else {
            $state.go("login");
        }
    })
});

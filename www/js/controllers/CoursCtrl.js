appCtrl.controller('CoursCtrl', function($scope, LANGUES, STORAGE, PROFILE, $state, $ionicPlatform, $ionicLoading) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log(user);
                console.log(firebase.auth().currentUser);
                /*  var user = DATABASE.getDataUser(user.uid);*/
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner>',
                    duration : 1000
                });
                PROFILE.getDataUserLanguesDispo(user.uid, function(languesDispo) {
                    $scope.langues = languesDispo;
                });
            } else {
                $state.go("login");
            }
        });
    });
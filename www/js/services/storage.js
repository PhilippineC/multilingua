appServices

    .factory('STORAGE', function($ionicPlatform) {
        var storage = firebase.storage();

        return {
            getDrapeau : function(langueNom, callback) {
                var drapeauReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/drapeau/' + langueNom + '.jpg');
                drapeauReference.getDownloadURL().then(function (src) {
                    callback(src);
                }).catch(function (error) {
                    console.log(error)
                });
            }
        };
    });


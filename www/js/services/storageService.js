appServices
    .factory('storageService', function() {
        var storage = firebase.storage();

        return {
            getDrapeau : function(langueNom, callback) {
                var drapeauReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/drapeau/' + langueNom + '.jpg');
                drapeauReference.getDownloadURL().then(function (src) {
                    callback(src);
                }).catch(function (error) {
                    console.log(error)
                });
            },

            getAvatar : function(responsableImg, callback) {
                var avatarReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/avatar/' + responsableImg);
                avatarReference.getDownloadURL().then(function (src) {
                    callback(src);
                 }).catch(function (error) {
                    console.log(error);
                });
            },

            getAudio : function(leconId, callback) {
                var audioReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/cours_audio/Cours' + leconId + '.mp3');
                audioReference.getDownloadURL().then(function (src) {
                    callback(src);
                }).catch(function (error) {
                    console.log(error);
                });
            },

            getLogo : function(callback) {
                var logoReference = storage.refFromURL('gs://multilingua-d2319.appspot.com/logo/logo.jpg');
                logoReference.getDownloadURL().then(function (src) {
                    callback(src);
                }).catch(function (error) {
                    console.log(error);
                });
            }
        };
    });


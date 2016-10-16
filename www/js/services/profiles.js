appServices

    .factory('PROFILE', function($firebaseArray, $firebaseObject) {
        var refProfiles = new Firebase("https://multilingua-d2319.firebaseio.com/profiles");
        return {
            getRefCoursTerm : function(uid) {
                return refProfiles.child(uid).child('coursTerm');
            },

            getRefNotifActive : function(uid) {
                return refProfiles.child(uid).child('notifActive');
            },

            getRefNotifActiveDefaut : function(uid) {
                return refProfiles.child(uid).child('notifActiveDefaut');
            },

            getDataUser : function(uid) {
                return $firebaseObject(refProfiles.child(uid));
            },

            getDataUserLanguesDispo : function(uid) {
                return $firebaseArray(refProfiles.child(uid).child('languesDispo'));
            },

            getDataUserCoursTerm : function(uid) {
                return $firebaseArray(refProfiles.child(uid).child('coursTerm'));
            },

            getDataUserNotif : function(uid) {
                var data = refProfiles.child(uid).child('notifActive');
                return $firebaseArray(data);
            }
        };
    });


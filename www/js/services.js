angular.module('starter.services', [])

.constant('CONSTANTES' , {
    'NBEXS': 3,
    'NBEXS_SUPP': 2
})

.factory('DATABASE', function($firebaseArray, $firebaseObject) {
  var ref = new Firebase("https://multilingua-d2319.firebaseio.com");
  var refLangues = new Firebase("https://multilingua-d2319.firebaseio.com/langues");
  var refProfiles = new Firebase("https://multilingua-d2319.firebaseio.com/profiles");
  var refResponsables = new Firebase("https://multilingua-d2319.firebaseio.com/responsables");

  return {
    getLangues: function(orderparam) {
      return $firebaseArray(refLangues.orderByChild(orderparam));
    },

    getDatesFormation: function(langueId) {
      var data = refLangues.child(langueId).child('datesFormation').orderByChild('date');
      return $firebaseArray(data);
    },

    getResponsables : function() {
      return $firebaseArray(refResponsables);
    },

    getLangue : function(langueId) {
      var data = refLangues.child(langueId);
      return $firebaseObject(data);
    },

    getLecon : function(langueId, leconId) {
      var data = refLangues.child(langueId).child('cours').child(leconId);
      return $firebaseObject(data);
    },

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
      return $firebaseObject(ref.child('profiles').child(uid));
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

  /*  get: function(section, id) {
      var data = null;
      ref = new Firebase("https://multilingua-d2319.firebaseio.com"+"/" + section);
      ref.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          if (childData.id == id) {
            data = childData;
            return true;
          }
        })
      });
      return data;
    },
    getData: function(langueId, leconId) {
      var data, cours = null;
      ref = new Firebase("https://multilingua-d2319.firebaseio.com/langues");
      ref.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          if (childData.id == langueId) {
            cours = childData.cours;
            angular.forEach(cours, function (lecon) {
              if (lecon.id == leconId) {
                data = lecon;
                return true;
              }
            });
          }
        })
      });
      return data;
    }*/
  };


});


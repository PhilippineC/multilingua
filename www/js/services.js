angular.module('starter.services', [])

.constant('CONSTANTES' , {
    'NBEXS': 3,
    'NBEXS_SUPP': 2
})

.factory('DATABASE', function($firebaseArray, $firebaseObject) {
  var ref = new Firebase("https://multilingua-d2319.firebaseio.com");
 /* var User = $firebaseObject.$extend({
    LanguesDispo : function() {
      return this.$getRecord;
    }
  });*/

  return {
  /*  getLanguesDispo : function(uid) {
      var util = ref.child('profiles').child(uid);
      var user = new User(util);
      return user.LanguesDispo();
    },*/


    all: function(section, orderparam) {
      var data = $firebaseArray(ref.child(section).orderByChild(orderparam));
      return data;
    },

    getDataUser : function(uid) {
      var user = $firebaseObject(ref.child('profiles').child(uid));
      return user;
     },

    getDataUserLanguesDispo : function(uid) {
      var languesDispo = ref.child('profiles').child(uid).child('languesDispo');
      return $firebaseArray(languesDispo);
    },


    getDataUserCoursTerm : function(uid) {
      var data = ref.child('profiles').child(uid).child('coursTerm');
      return $firebaseArray(data);
    },


    get: function(section, id) {
      var data = null;
      ref = new Firebase("https://multilingua-d2319.firebaseio.com"+"/" + section);
      ref.once("value", function(snapshot) {
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
    }
  };


});


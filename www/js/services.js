angular.module('starter.services', [])

.factory('DATABASE', function($firebaseArray, $firebaseObject) {
  var ref = new Firebase("https://multilingua-d2319.firebaseio.com");

  return {
    all: function(section, orderparam) {
      var data = $firebaseArray(ref.child(section).orderByChild(orderparam));
      return data;
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
            console.log(cours);
            angular.forEach(cours, function (lecon) {
              if (lecon.id == leconId) {
                console.log(lecon);
                data = lecon;
                return true;
              }
            });
          }
        })
      });
      return data;
    },
  };

});


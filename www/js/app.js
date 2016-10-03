// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.cours', {
    url: '/cours',
    views: {
      'tab-cours': {
        templateUrl: 'templates/cours/tab-cours.html',
        controller: 'CoursCtrl'
      }
    }
  })

  .state('tab.cours-langue', {
    url: '/cours/:langueId',
    views: {
      'tab-cours': {
        templateUrl: 'templates/cours/cours-langue.html',
        controller: 'CoursLangueCtrl'
      }
    }
  })

  .state('tab.cours-lecon', {
    url: '/cours/:langueId/:leconId',
    views: {
      'tab-cours': {
        templateUrl: 'templates/cours/cours-lecon.html',
        controller: 'CoursLeconCtrl'
      }
    }
  })

  .state('tab.cours-exercice', {
    url: '/cours/:langueId/:leconId/:exerciceId/:leconEnCoursId/:exEnCours',
    views: {
      'tab-cours': {
        templateUrl: 'templates/cours/cours-exercice.html',
        controller: 'CoursExerciceCtrl'
      }
    }
  })

   .state('tab.cours-exercice-fin', {
     url: '/cours/:langueId/:leconId/fin',
     views: {
       'tab-cours': {
         templateUrl: 'templates/cours/cours-exercice-fin.html',
         controller: 'CoursExerciceFinCtrl'
       }
     }
   })

  .state('tab.agenda', {
      url: '/agenda',
      views: {
        'tab-agenda': {
          templateUrl: 'templates/agenda/tab-agenda.html',
          controller: 'AgendaCtrl'
        }
      }
    })

    .state('tab.agenda-langue', {
      url: '/agenda/:langueId',
      views: {
        'tab-agenda': {
          templateUrl: 'templates/agenda/agenda-langue.html',
          controller: 'AgendaLangueCtrl'
        }
      }
    })

  .state('tab.contact', {
    url: '/contact',
    views: {
      'tab-contact': {
        templateUrl: 'templates/contact/tab-contact.html',
        controller: 'ContactCtrl'
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('param', {
    url: '/parameters',
    templateUrl: 'templates/parameters.html',
    controller: 'ParamCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('login');

});

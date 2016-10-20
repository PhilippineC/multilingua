appServices
    .factory('notificationsService', function() {
        return {
            pushNotif: function(dateId, langueNom, dateHeure, dateLieu, dateFormation) {
                cordova.plugins.notification.local.schedule({
                    id: dateId,
                    text: 'Rappel formation : ' + langueNom + ' à ' + dateHeure + ' en ' + dateLieu + '.',
                    at: new Date(dateFormation - 3600 * 1000) // On retire une heure*/
                })
            },

            cancelNotif: function(dateId) {
                cordova.plugins.notification.local.cancel(dateId, function () {
                    console.log("Notif annulée : " + dateId);
                });

            }
        }
    });


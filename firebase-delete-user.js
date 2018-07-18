const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

var dbname = "pawpads-rn"
var path = "/users/{fireid}/isDeleted"

// Listens for new messages added to /users/{fireid}/isDeleted and
// formally deletes the user if the value is True
exports.makeUppercase = functions.database.instance(dbname).ref(path)
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const deleted = snapshot.val();
      if(deleted === True){
        var account = snapshot.parent
        dpath = '/users/'+account
        functions.database.instance(dbname).ref(dpath).remove()
        .then(function() {
            console.log("Remove succeeded.")
          })
          .catch(function(error) {
            console.log("Remove failed: " + error.message)
          });
      }
    });

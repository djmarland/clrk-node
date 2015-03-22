/**
 * Module dependencies.
 */
var app = require('app');

/**
 * Get port from environment and store in Express.
 */

var port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

app.listen(port, function() {
    console.log("Listening on " + port);
});

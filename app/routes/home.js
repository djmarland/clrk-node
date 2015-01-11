var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

  var customers, total;

  var Customer = app.get('db').define('customer', {
    name: {
      type: Sequelize.STRING,
      field: 'name'
    }
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

/*
  Customer.sync({force: true}).then(function () {
    // Table created
    return Customer.create({
      name: 'Michael'
    });
  });
*/

  Customer
      .findAndCountAll({
        where: ["id > ?", 0],
        offset: 0,
        limit: 10
      })
      .then(function(result) {
        total = result.count;
        customers = result.rows;

        res.render('home', {
          "total" : total,
          "customers" : customers }
        );

      });




});

module.exports = router;

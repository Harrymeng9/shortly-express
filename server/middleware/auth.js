const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  var result = {};
  if (Object.keys(req.cookies).length === 0) {
    // console.log(1);
    // req.session = result;
    var sessionHash = models.Sessions.create();
    sessionHash
      .then(data => {
        var sessionHashGet = models.Sessions.get({ id: 1 });
        sessionHashGet
          .then(data => {
            result.hash = data.hash;
            req.session = result;
            res.cookies = {shortlyid: {value: data.hash}};
            next();
          });
      })
      .error(err => console.log(err));
  } else {
    var cookie = req.cookies['shortlyid'];
    req.session = {hash: cookie};
    next();
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/


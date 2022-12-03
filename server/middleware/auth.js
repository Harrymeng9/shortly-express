const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  var result = {};
  models.Sessions.get({ hash: req.cookies.shortlyid })
    .then(data => {
      if (data === undefined) {
        var sessionHash = models.Sessions.create();
        sessionHash
          .then(data1 => {
            var sessionHashGet = models.Sessions.get({ id: data1.insertId });
            sessionHashGet
              .then(data2 => {
                result.hash = data2.hash;
                req.session = result;
                res.cookies = { shortlyid: { value: data2.hash } };
                next();
              });
          })
          .error(err => console.log(err));

      } else {
        var cookie = req.cookies['shortlyid'];
        req.session = { hash: cookie };

        var getSessionHash = models.Sessions.get({ hash: cookie });
        getSessionHash
          .then(data1 => {
            if (data1.user !== undefined) {
              req.session.user = { username: data1.user.username };
              req.session.userId = data1.userId;
            }
            next();
          });
      }
    });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
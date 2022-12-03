const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  var result = {};
  if (req.cookies.shortlyid) {
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(data => {
        if (data === undefined) {
          models.Sessions.create()
            .then(data1 => {
              models.Sessions.get({ id: data1.insertId })
                .then(data2 => {
                  result.hash = data2.hash;
                  req.session = result;
                  res.cookie('shortlyid', req.session.hash);
                  res.cookies = { shortlyid: { value: data2.hash } };
                  next();
                });
            });
        } else {
          var cookie = req.cookies['shortlyid'];
          req.session = { hash: cookie };
          var getSessionHash = models.Sessions.get({ hash: cookie });
          getSessionHash
            .then(data1 => {
              if (data1.user !== undefined) {
                req.session.user = { username: data1.user.username };
                req.session.userId = data1.userId;
                res.cookies = { shortlyid: { value: cookie } };
              }
              next();
            });
        }
      });
  } else {
    models.Sessions.create()
      .then(data1 => {
        models.Sessions.get({ id: data1.insertId })
          .then(data2 => {
            result.hash = data2.hash;
            req.session = result;
            res.cookie('shortlyid', req.session.hash);
            res.cookies = { shortlyid: { value: data2.hash } };
            next();
          });
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {

};



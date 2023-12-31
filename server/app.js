const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');

const parseCookies = require('./middleware/cookieParser');

// const bodyParser =require('body-parser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(parseCookies);
app.use(Auth.createSession);
// app.use(Auth.verifySession);
// app.use(bodyParser.urlencoded({ extended: true}));

app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup',
  (req, res) => {
    var checkUsers = models.Users.get({ username: req.body.username });

    checkUsers
      .then(data => {
        if (data !== undefined) {
          res.location('/signup');
          res.status(301).send('Username is already taken');
        } else {
          var createUser = models.Users.create({ username: req.body.username, password: req.body.password });
          createUser
            .then(data => {
              res.location('/');
              res.status(200).send('signup success');
            })
            .error(error => {
              res.status(500).send('signup error');
            });
        }
      });
  });

app.post('/login',
  (req, res) => {
    var checkUsers = models.Users.get({ username: req.body.username });

    checkUsers
      .then(data => {
        // If username exists
        if (data !== undefined) {
          // Check whether password is correct or not
          if (!models.Users.compare(req.body.password, data.password, data.salt)) {
            res.location('/login');
            res.status(400).send('Password is wrong');
          } else {
            res.location('/');
            res.status(200).send('Login successful');
          }
        } else {
          res.location('/login');
          res.status(400).send('Username does not exist');
        }
      })
      .error(error => {
        res.location('/login');
        res.status(500).send('Username and/or password is incorrect');
      });
  });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;

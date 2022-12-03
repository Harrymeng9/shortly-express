const parseCookies = (req, res, next) => {
  var result = {};
  var anyCookies = req.headers.cookie;
  if (anyCookies !== undefined) {
    var splitColonSpaceArr = anyCookies.split('; ');
    for (var i of splitColonSpaceArr) {
      var splitEqual = i.split('=');
      result[splitEqual[0]] = splitEqual[1];
    }
  } else {
    // req.cookies = result;
    // result['hello'] = 'world';

  }
  req.cookies = result;
  next();
};

module.exports = parseCookies;


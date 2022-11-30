const parseCookies = (req, res, next) => {
  var result = {};
  var anyCookies = req.headers.cookie;
  if (anyCookies === undefined) {
    req.headers.cookie = result;
    console.log('req.headers.cookie', req.headers.cookie);
    // return result;
  } else {
    var splitColonSpaceArr = anyCookies.split('; ');
    console.log(splitColonSpaceArr)
    for (var i of splitColonSpaceArr) {
      var splitEqual = i.split('=');
      console.log(splitEqual)
      result[splitEqual[0]] = splitEqual[1];
    }
    console.log('result', result)
    req.headers.cookie = result;
    // return result;
  }
  // console.log('header', req.headers);
  next();
};

module.exports = parseCookies;


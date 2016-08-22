var express = require('express');
var path = require('path');
var router = express.Router();


router.get('/partials/:name', function(req, res) {
    res.render('partials/'+name);
});

router.get('/images/:name', function(req, res) {
    res.render('images/'+name);
});

router.get('/*', function(req, res) {
    res.render(path.join(__dirname, '../../client/index'));
});

module.exports = router;
var result = require('../models/result');
var hash = require('object-hash');
var queryBuilder = require('../api/elasticQueryBuilder');

var generateHashCodeRouter = function(app, rConfig) {
    app.post('/generateHashCode', function(req, res) {
        var q = req.body.q;
        var generatedHash = hash(q, { algorithm: 'md5', encoding: 'hex' });
        res.send( new result('OK', generatedHash, "success") );
    });
};
module.exports = generateHashCodeRouter;

var result = require('../models/result');
var hash = require('object-hash');
var queryBuilder = require('../api/elasticQueryBuilder');

var generateHashCodeRouter = function(app, rConfig) {
    app.post('/generateHashCode', function(req, res) {
        var q = req.body.q;
        var finalQuery = queryBuilder.buildSearchQuery(q, true);
       // var hash = crypto.createHash('md5').update("Test").digest('hex');
        var generatedHash = hash(finalQuery, { algorithm: 'md5', encoding: 'hex' });
        //res.send( hash );
        res.send( new result('OK', generatedHash, "success") );
    });
};
module.exports = generateHashCodeRouter;

var Aggregation = function(bucket, countKey) {
    this.name = bucket['key'];
    this[countKey] = bucket['doc_count'];
};

module.exports = Aggregation;

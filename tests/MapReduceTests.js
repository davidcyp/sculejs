var sculedb   = require('../lib/com.scule.db');
var jsunit    = require('../lib/com.scule.jsunit');

function testCollectionMapReduce() {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    collection.ensureIndex(sculedb.Scule.$c.INDEX_TYPE_BTREE, 'a.b', {order:100});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
           a:{
               b:sculedb.Scule.$f.randomFromTo(1, 10)
           },
           bar:'foo'+r,
           arr:[r, r+1, r+2, r+3],
           scl:i
        });
    }
    collection.mapReduce(
        function(document, emit) {
            emit(document.bar, {scl: document.scl});
        },
        function(key, reduce) {
            var o = {
                count: 0,
                total: 0,
                key: key
            };
            reduce.forEach(function(value) {
                o.count++;
                o.total += value.scl;
            });
            return o;
        },
        {
            out:{
                reduce:'scule+dummy://mapreduce'
            },
            finalize:function(key, reduced) {
                reduced.finalized = key;
                return reduced;
            }
        },
        function(out) {
            var o = out.findAll();
            jsunit.assertEquals(o[0].total, 49500);
            jsunit.assertEquals(o[0].finalized, o[0].key);
            jsunit.assertEquals(o[1].total, 49600);
            jsunit.assertEquals(o[1].finalized, o[1].key);
            jsunit.assertEquals(o[2].total, 49700);
            jsunit.assertEquals(o[2].finalized, o[2].key);
            jsunit.assertEquals(o[3].total, 49800);
            jsunit.assertEquals(o[3].finalized, o[3].key);
            jsunit.assertEquals(o[4].total, 49900);
            jsunit.assertEquals(o[4].finalized, o[4].key);
            jsunit.assertEquals(o[5].total, 50000);
            jsunit.assertEquals(o[5].finalized, o[5].key);
            jsunit.assertEquals(o[6].total, 50100);
            jsunit.assertEquals(o[6].finalized, o[6].key);
            jsunit.assertEquals(o[7].total, 50200);
            jsunit.assertEquals(o[7].finalized, o[7].key);
            jsunit.assertEquals(o[8].total, 50300);
            jsunit.assertEquals(o[8].finalized, o[8].key);
            jsunit.assertEquals(o[9].total, 50400);
            jsunit.assertEquals(o[9].finalized, o[9].key);
        }
    );
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testCollectionMapReduce);
    jsunit.runTests();
}());
var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testBPlusTreeIndexSearch1() {  
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i, i+1, i+2, i+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    
    result = index.search(9);
    jsunit.assertEquals(result.length, 30);
    result.forEach(function(o) {
        jsunit.assertEquals(o.a, 9); 
    });
    
    result = index.search(3);
    jsunit.assertEquals(result.length, 30);
    result.forEach(function(o) {
        jsunit.assertEquals(o.a, 3); 
    });    
};

function testBPlusTreeIndexSearch2() {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a,e.f.2');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    
    result = index.search('3,5');
    jsunit.assertEquals(result.length, 30);
    result.forEach(function(o) {
        jsunit.assertEquals(o.a, 3); 
        jsunit.assertEquals(o.e.f[2], 5);
    });
};

function testBPlusTreeIndexSearch3() {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('foo');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    
    result = index.search('bar3');
    jsunit.assertEquals(result.length, 30);
    result.forEach(function(o) {
        jsunit.assertEquals(o.a, 3); 
        jsunit.assertEquals(o.foo, 'bar3');
    });
};

function testBPlusTreeIndexClear() {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a,e.f.2');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    jsunit.assertTrue(index.clear());
    
    result = index.search('3,5');
    jsunit.assertEquals(result.length, 0);
};

function testBPlusTreeIndexRange() {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('c.d');
    for(var i=0; i < 3000; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    
    var result = index.range(1000, 2500, true, true);
    jsunit.assertEquals(result.length, 1501);
    jsunit.assertEquals(result[0].c.d, 1000);
    jsunit.assertEquals(result[1500].c.d, 2500);
};

function testBPlusTreeIndexRemove() {
    var document, result, document;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('c.d');
    for(var i=0; i < 3000; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    result   = index.search(1000);
    jsunit.assertEquals(result.length, 1);
    
    document = result[0];
    index.remove(document);
    
    result   = index.search(1000);
    jsunit.assertEquals(result.length, 0);
};

function testBPlusTreeIndexRemoveKey() {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a');
    for(var i=0; i < 3000; i++) {
        document = {
            _id: sculedb.getObjectId(),
            a:i%10,
            c:{
                d:i
            },
            e:{
                f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + (i%10),
            bar:'foo' + (i%10)
        };
        index.index(document);
    }
    result   = index.search(3);
    jsunit.assertEquals(result.length, 300);
    
    document = result[0];
    index.removeKey(3);
    
    result   = index.search(3);
    jsunit.assertEquals(result.length, 0);
    
    jsunit.assertFalse(index.leaves.contains(document._id));
};

function testBPlusTreeIndexPerformace() {
    var index = sculedb.getBPlusTreeIndex(1000);  
    index.parseAttributes('a,bar');
    var documents = [];
    for(var i=0; i < 100000; i++) {
        var r = (i%10);
        var document = {
            _id: sculedb.getObjectId(),
            a:r,
            c:{
                d:i
            },
            e:{
                f:[r, r+1, r+2, r+3]
            },
            f:[2, 7, 6, 0],
            foo:'bar' + r,
            bar:'foo' + r
        };
        documents.push(document);
    }
    var ts = (new Date()).getTime();
    documents.forEach(function(document) {
        index.index(document);
    });
    //console.log('');
    //console.log('took ' + ((new Date().getTime()) - ts) + ' to load b+tree with 100000 entries');
    //console.log('');    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testBPlusTreeIndexSearch1);
    jsunit.addTest(testBPlusTreeIndexSearch2);
    jsunit.addTest(testBPlusTreeIndexSearch3);
    jsunit.addTest(testBPlusTreeIndexClear);
    jsunit.addTest(testBPlusTreeIndexRange);
    jsunit.addTest(testBPlusTreeIndexRemove);
    jsunit.addTest(testBPlusTreeIndexRemoveKey);
    jsunit.addTest(testBPlusTreeIndexPerformace);
    jsunit.runTests();
}());
var sculedb   = require('../lib/com.scule.datastructures');
var db   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testBPlusHashingTreeVerifyKeys(node) {
    if(node.isLeaf()) {
        return;
    }
    var key, left, right;
    for(var i=1; i < node.data.length; i=i+2) {
        key   = node.data[i];
        left  = node.data[i-1];
        right = node.data[i+1];
        if(left.isLeaf() && right.isLeaf()) {
            jsunit.assertTrue(left.data[0].key < key);
            jsunit.assertTrue(right.data[0].key == key);                
            return;
        }
        jsunit.assertTrue(left.data[1] < key);
        jsunit.assertTrue(right.data[1] >= key);
        testBPlusHashingTreeVerifyKeys(left);
        testBPlusHashingTreeVerifyKeys(right);
    }    
};

function testBPlusHashingTreeLinkedListOrder(tree) {
    var prev = undefined;    
    var curr = tree.root.data[0];
    while(curr) {
        jsunit.assertEquals(prev, curr.getLeft());
        prev = curr;       
        curr = curr.getRight();
    }    
};

function testBPlusHashingTreeVerifyOrder(node) {
    if(node.isLeaf()) {
        for(var i=0; i < node.data.length; i++) {
            if(i > 0) {
                for(var j=0; j < i; j++) {
                    jsunit.assertFalse(node.data[j].key >= node.data[i].key);
                }
            }
        }
    } else {
        for(var i=0; i < node.data.length; i=i+2) {
            testBPlusHashingTreeVerifyOrder(node.data[i]);
        }
    }    
};

function testBPlusHashingTreeInsert() {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 200; i++) {
        var k = sculedb.Scule.$f.randomFromTo(10, 200);
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);
    }
    testBPlusHashingTreeVerifyKeys(tree.root);
    testBPlusHashingTreeVerifyOrder(tree.root);
};

function testBPlusHashingTreeInsert2() {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 10; i++) {
        var k = sculedb.Scule.$f.randomFromTo(10, 200);
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);
    }
    testBPlusHashingTreeVerifyKeys(tree.root);
    testBPlusHashingTreeVerifyOrder(tree.root);
    testBPlusHashingTreeLinkedListOrder(tree);
};

function testBPlusHashingTreeInsert3() {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 100; i++) {
        var k = i%10;
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);        
    }
    for(var i=0; i < 10; i++) {
        var table = tree.search(i);
        jsunit.assertEquals(table.getLength(), 10);
        var keys = table.getKeys();
        keys.forEach(function(key) {
           jsunit.assertEquals(table.get(key).key, i);
           jsunit.assertEquals(table.get(key)._id.toString(), key);
        });
    }
}

function testBPlusHashingTreeRemove() {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 100; i++) {
        var k = i%10;
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);        
    }
    tree.remove(5);
    jsunit.assertEquals(tree.search(5), null);
    tree.remove(2);
    jsunit.assertEquals(tree.search(2), null);    
    jsunit.assertNotEquals(tree.search(9), null);    
}

function testBPlusHashingTreeRange() {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 2000; i++) {
        var k = sculedb.Scule.$f.randomFromTo(10, 2000);
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);
    }
    var range = tree.range(333, 1987);
    var broken = false;
    for(var i=0; i < range.length; i++) {
        for(var j=0; j < i; j++) {
            if(range[j] > range[i]) {
                broken = true;
                break;
            }
        }
    }
    jsunit.assertFalse(broken);
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testBPlusHashingTreeInsert);
    jsunit.addTest(testBPlusHashingTreeInsert2);
    jsunit.addTest(testBPlusHashingTreeInsert3);
    jsunit.addTest(testBPlusHashingTreeRemove);
    jsunit.addTest(testBPlusHashingTreeRange);
    jsunit.runTests();
}());
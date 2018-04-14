


var cutil = require("../../../../modules/signsensus/lib/consUtil.js");

function generateTransactions(noTransactions){
    var transactions = [];
    for(var i=0; i<noTransactions; i++){
        var t = {};
        t.digest="T"+i;
        t.CP = cutil.getRandomInt(5);
        transactions.push(t);
    }
    return transactions;
}

var trans=generateTransactions(10);
console.log(trans);

function encode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '')
        .replace(/\//g, '')
        .replace(/=+$/, '');
};

function stampWithTime(buf, salt){
    if(!salt){
        salt = 1;
    }
    var date = new Date;
    var ct = Math.floor(date.getTime() / salt);
    var counter = 0; ;
    while(ct > 0 ){
        //console.log("Counter", counter, ct);
        buf[counter] = Math.floor(ct % 256);
        ct = Math.floor(ct / 256);
        counter++;
    }
}


__safe_uuid = function(callback) {
    require('crypto').randomBytes(32, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf);
        callback(null, encode(buf));
    });
}


/*
    Try to generate a small UID that is unique against chance in the same second and in a specific context (eg in the same choreography execution)
    The id contains around 12*8 = 96 bits of randomness and are unique at the level of seconds
    This method should be used only on a single computer
 */
__short_uuid = function(callback) {

    require('crypto').randomBytes(16, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf, 1000);
        callback(null, encode(buf));
    });
}


__safe_uuid(function(err,res){
    console.log(res, res.length);
});

__short_uuid(function(err,res){
    console.log(res, res.length);
});

exports.dumpObjectForDigest = function(obj){
    var result = "";

    if(obj == null){
        return "null";
    }
    if(obj == undefined){
        return "undefined";
    }

    var keys = Object.keys(obj);
    keys.sort();

    function dumpMember(obj){
        var type = typeof obj;
        if(obj == null){
            return "null";
        }
        if(obj == undefined){
            return "undefined";
        }

        switch(type){
            case "number":
            case "string":
            case "boolean": return obj.toString('hex'); break;
            case "object": return dumpObjectForDigest(member); break;
            case "array":
                var result ="";
                for(var i=0; i < obj.length; i++){
                    result+= dumpObjectForDigest(obj[i]);
                }
                return result;
                break;
            default:
                console.log("Type ", type, " cannot be cryptographically digested properly");
        }

    }

    console.log(result);
    for(var i=0; i < keys.length; i++){
        result += dumpMember(keys[i]);
        result += dumpMember(obj[keys[i]]);
    }

    return result;
}
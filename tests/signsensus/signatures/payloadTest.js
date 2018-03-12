const payload = require("../../../modules/signsensus/lib/ssutil");

var str = "1c4a796577863ba5ea33b3034eb99e42e892567d7778158277d59ff0a99eba9c";
console.log(str);

console.log(payload.wipeOutsidePayload(str, 60, 5), payload.extractPayload(str, 60, 5));
console.log(payload.fillPayload(payload.extractPayload(str, 60, 5), 60, 5));



console.log(payload.wipeOutsidePayload(str, 0, 16), payload.extractPayload(str, 0, 16));
console.log(payload.fillPayload(payload.extractPayload(str, 0, 16), 0, 16));
console.log(payload.wipeOutsidePayload(str, 16, 16), payload.extractPayload(str, 16, 16));
console.log(payload.fillPayload(payload.extractPayload(str, 16, 16), 16, 16));
console.log(payload.wipeOutsidePayload(str, 60, 4), payload.extractPayload(str, 60, 4));
console.log(payload.fillPayload(payload.extractPayload(str, 60, 4), 60, 4));
console.log(payload.wipeOutsidePayload(str, 60, 16), payload.extractPayload(str, 60, 16));
console.log(payload.fillPayload(payload.extractPayload(str, 60, 16), 60, 16));



console.log(payload.wipeOutsidePayload(str, 0, 64), payload.extractPayload(str, 0, 64));
console.log(payload.fillPayload(payload.extractPayload(str, 0, 64), 0, 64));

console.log(payload.wipeOutsidePayload(str, 1, 64), payload.extractPayload(str, 1, 64));
console.log(payload.fillPayload(payload.extractPayload(str, 1, 64), 1, 64));




console.log(payload.wipeOutsidePayload(str, 63, 64), payload.extractPayload(str, 63, 64));
console.log(payload.fillPayload(payload.extractPayload(str, 63, 64), 63, 64));



console.log(payload.wipeOutsidePayload(str, 63, 16), payload.extractPayload(str, 63, 16));
console.log(payload.fillPayload(payload.extractPayload(str, 63, 16), 63, 16));

console.log(payload.wipeOutsidePayload(str, 62, 16), payload.extractPayload(str, 62, 16));
console.log(payload.fillPayload(payload.extractPayload(str, 62, 16), 62, 16));

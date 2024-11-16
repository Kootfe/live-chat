const crypto = require('crypto');
function genereateToken() {
    return crypto.randomBytes(128).toString('hex');
}

console.log(genereateToken())
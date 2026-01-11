const crypto = require('crypto');
function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
const token = process.argv[2];
const secret = process.argv[3];
if(!token || !secret) {
  console.error('Usage: node verify.js <token> <secret>')
  process.exit(1);
}
const [h, p, s] = token.split('.');
const expected = base64url(crypto.createHmac('sha256', secret).update(h + '.' + p).digest());
console.log('expected:', expected);
console.log('sig:', s);
console.log('match:', expected === s);

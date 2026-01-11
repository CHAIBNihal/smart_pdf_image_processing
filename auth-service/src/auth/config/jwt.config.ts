
import * as dotenv from 'dotenv';

// Charger les variables d'environnement AVANT tout
dotenv.config();

const secret = process.env.JWT_SECRET;


if (!secret) {
  console.log('JWT_SECRET USED:', process.env.JWT_SECRET);
  console.error('undefined Token ', secret)
  throw new Error('JWT_SECRET env var must be set');
}
export const jwtConstants = { secret };
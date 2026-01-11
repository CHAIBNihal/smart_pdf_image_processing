import { registerAs } from "@nestjs/config";
import * as dotenv from 'dotenv';

// Charger les variables d'environnement AVANT tout
dotenv.config();

export default registerAs('googleOAuth', () => {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;

    // Validation des variables requises
    if (!clientID) {
        throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
    }
    if (!clientSecret) {
        throw new Error('GOOGLE_SECRET is not defined in environment variables');
    }
    if (!callbackURL) {
        throw new Error('GOOGLE_CALLBACK_URL is not defined in environment variables');
    }

    return {
        clientID,
        clientSecret,
        callbackURL
    };
});
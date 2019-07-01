# uftc-backend

Capstone projekti

## Ohjeet

1. kloonaa projekti, mene sen kansioon
2. `npm install` asentaa noden moduulit
3. asenna MongoDB Community Edition https://docs.mongodb.com/manual/administration/install-community/
   - kannattaa asentaa myös ehdotettu Compass
   - käyttääksesi esim. MongoDBn atlasta, lisää projektiin .env tiedosto, jossa MONGODB_URI=your_connection_string
4. `npm run watch` käynnistää palvelimen nodemonin kanssa
   - POST http://localhost:3001/api/users/register
   - POST http://localhost:3001/api/users/login
   - GET http://localhost:3001/api/users/ (passport.js protected, needs the token in the header)

### Koodissa yhdistelty

- kurssimateriaalin 4. kappaleen ohjeita: https://fullstackopen.com/osa4/token_perustainen_kirjautuminen
- Passport.JS tutoriaalia: https://medium.com/@therealchrisrutherford/nodejs-authentication-with-passport-and-jwt-in-express-3820e256054f

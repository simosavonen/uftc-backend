# uftc-backend

Capstone projekti

## Ohjeet

1. kloonaa projekti, mene sen kansioon
2. `npm install` asentaa noden moduulit
3. asenna MongoDB Community Edition https://docs.mongodb.com/manual/administration/install-community/
   - kannattaa asentaa myös ehdotettu Compass
   - käyttääksesi esim. MongoDBn atlasta, lisää projektiin .env tiedosto, jossa MONGODB_URI=your_connection_string
4. `npm run watch` käynnistää palvelimen nodemonin kanssa

## Mikä toimii?

- POST http://localhost:3001/api/users/register
- POST http://localhost:3001/api/users/login
- GET http://localhost:3001/api/users/

- POST http://localhost:3001/api/activities/
- GET http://localhost:3001/api/activities/

- POST http://localhost:3001/api/challenges/
- GET http://localhost:3001/api/challenges/

- POST http://localhost:3001/api/workouts/
- GET http://localhost:3001/api/workouts/

- GET http://localhost:3001/api/scores/

## Mikä ei?

- Saavutukset tai mitalit
- Asioiden muokkaaminen tai poistaminen, nyt voi vasta lisätä
- Validointia ei vielä missään, jos annat vajavaiset tai väärin muodoillut lähtötiedot, homma ei toimi
- Virheitä ei ehkä näe mistään, yhtään console.log() ei ole lisätty.

Kansiossa REST on oikein muotoiltuja API kutsuja, ja erillinen README.md joka neuvoo missä järjestyksessä ne kannattaa testata.

### Koodissa yhdistelty

- kurssimateriaalin 4. kappaleen ohjeita: https://fullstackopen.com/osa4/token_perustainen_kirjautuminen
- Passport.JS tutoriaalia: https://medium.com/@therealchrisrutherford/nodejs-authentication-with-passport-and-jwt-in-express-3820e256054f

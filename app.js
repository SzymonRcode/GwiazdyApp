const express = require('express');
const cors = require('cors');
const app = express();
const moment = require('moment');
const basicAuth = require('express-basic-auth');

require('dotenv/config');
require('./connect')
app.use(express.json());
app.use(cors());
app.use(basicAuth({
  users: { [process.env.BASIC_AUTH_USER] : process.env.BASIC_AUTH_PASSWORD },
  unauthorizedResponse: { message: "Brak autoryzacji" } 
}));

app.use((req, res, next) => {
  console.log('Time: ', moment().format('MMMM Do YYYY, h:mm:ss a'));
  next();
});

// JSON Obsługa błędnego formatu
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).send({ message: 'Przekazano błędny format danych! (JSON)' }); // Bad request
  }
  next();
});

app.get('/', (req, res) => {
  res.json({ Api: 'Witaj w API Gwiazdy!'});
})
const starsRouter = require('./routes/stars');
const calendarRouter = require('./routes/calendar');
const constellationsRouter = require('./routes/constellations');
app.use('/calendar', calendarRouter);
app.use('/stars', starsRouter);
app.use('/constellations', constellationsRouter);

app.listen(process.env.PORT, () => {
  console.log(`Serwer został uruchomiony na porcie ${process.env.PORT}!`)
})
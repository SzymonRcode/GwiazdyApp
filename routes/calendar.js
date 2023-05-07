const express = require('express');
const router = express.Router();
const moment = require('moment');
const db = require('../connect');

// Wyświetlenie dostępnych dat
router.get('/', (req, res) => {
  const sql = "SELECT DATE_FORMAT(data, '%Y-%m-%d') data FROM kalendarz";
  db.query(sql, (error, result) => {
    if(error) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    } else if(result.length < 1) {
      return res.status(400).json({ message: 'Brak danych w tabeli kalendarz!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Pobranie danych z dnia po dacie
router.get('/:date', async (req, res) => {
  if(isValidDate(req.params.date)) {
    if(!(await checkDayExist(req.params.date))) {
      return res.status(400).json({ message: `Data ${req.params.date} nie istnieje w bazie!`});
    }
    const sql = `SELECT DATE_FORMAT(data, '%Y-%m-%d') data,zachmurzenie,faza_ksiezyca,rodzaj_opadu,gestosc_mgly FROM kalendarz WHERE data = '${req.params.date}'`;
    db.query(sql, (error, result) => {
      if(error) {
        return res.status(400).json({ message: 'Wystąpił błąd!' });
      } else if(result.length < 1) {
        return res.status(400).json({ message: `Brak danych o nocy w dniu: ${req.params.date}` });
      }
      const rows = JSON.parse(JSON.stringify(result));
      res.json(rows);
    });
  } else {
    return res.status(400).json({ message: 'Niepoprawny format daty, wymagany format: YYYY-mm-dd' });
  }
});
// Dodanie nowego dnia
router.put('/:date', async (req, res) => {
  if(isValidDate(req.params.date)) {
    if(await checkDayExist(req.params.date)) {
      return res.status(400).json({ message: `Data ${req.params.date} istnieje już w bazie!`});
    }
    if(isNaN(req.body.clouds) || isNaN(req.body.moon) || isNaN(req.body.fall) || isNaN(req.body.fog)) {
      return res.status(400).json({ message: 'Wszystkie wartości muszą być w formie liczbowej!'});
    } else if(req.body.clouds > 10 || req.body.clouds < 0) {
      return res.status(400).json({ message: 'Zachmurzenie musi być w przedziale 1-10!'});
    } else if(req.body.fog > 10 || req.body.fog < 0) {
      return res.status(400).json({ message: 'Wartość mgły musi być w przedziale 1-10!'});
    } else if(req.body.moon > 9 || req.body.moon < 1) {
      return res.status(400).json({ message: 'Wartość fazy księżyca musi być w przedziale 1-9!'});
    } else if(req.body.fall > 4 || req.body.fall < 0) {
      return res.status(400).json({ message: 'Wartość opadu musi być w przedziale 0-4!'});
    } else if(req.body.fall > 0 && req.body.clouds == 0){
      return res.status(400).json({ message: 'Opad nie może wystąpić przy bezchmurnym niebie!'});
    }
    const sql = `INSERT INTO kalendarz (data, zachmurzenie,faza_ksiezyca,rodzaj_opadu,gestosc_mgly) VALUES ('${req.params.date}',${req.body.clouds},${req.body.moon},${req.body.fall},${req.body.fog})`;
    db.query(sql, (error, result) => {
      if(error || result.affectedRows < 1) {
        return res.status(400).json({ message: 'Wystąpił błąd!'});
      }
      res.json({ message: `Dodano nowy dzień! - ${req.params.date}` });
    });
  } else {
    return res.status(400).json({ message: 'Niepoprawny format daty, wymagany format: YYYY-mm-dd' });
  }

});
// Edycja poziomu zachmurzenia
router.patch('/:date/clouds', async (req, res) => {
  if(isValidDate(req.params.date)) {
    if(!(await checkDayExist(req.params.date))) {
      return res.status(400).json({ message: `Data ${req.params.date} nie istnieje w bazie!`});
    }
    if(isNaN(req.body.clouds)) {
      return res.status(400).json({ message: 'Wartość zachmurzenia musi być liczbą!'});
    } else if(req.body.clouds > 10 || req.body.clouds < 0) {
      return res.status(400).json({ message: 'Zachmurzenie musi być w przedziale 1-10!'});
    }
    const sql = `UPDATE kalendarz SET zachmurzenie = ${req.body.clouds}, 
    rodzaj_opadu = CASE WHEN ${req.body.clouds} = 0 AND rodzaj_opadu > 0 THEN 0 ELSE (SELECT rodzaj_opadu FROM kalendarz WHERE data = '${req.params.date}') END WHERE data = '${req.params.date}'`;
    db.query(sql, (error, result) => {
      if(error || result.affectedRows < 1) {
        return res.status(400).json({ message: 'Wystąpił błąd!'});
      }
      res.json({ message: `Zmodyfikowano poziom zachmurzenia w dniu: ${req.params.date}` });
    });
  } else {
    return res.status(400).json({ message: 'Niepoprawny format daty, wymagany format: YYYY-mm-dd' });
  }
});
// Edycja gęstości mgły
router.patch('/:date/fog',async (req, res) => {
  if(isValidDate(req.params.date)) {
    if(!(await checkDayExist(req.params.date))) {
      return res.status(400).json({ message: `Data ${req.params.date} nie istnieje w bazie!`});
    }
    if(isNaN(req.body.fog)) {
      return res.status(400).json({ message: 'Wartość mgły musi być liczbą!'});
    } else if(req.body.fog > 10 || req.body.fog < 0) {
      return res.status(400).json({ message: 'Wartość mgły musi być w przedziale 1-10!'});
    }
    const sql = `UPDATE kalendarz SET gestosc_mgly = ${req.body.fog} WHERE data = '${req.params.date}'`;
    db.query(sql, (error, result) => {
      if(error || result.affectedRows < 1) {
        return res.status(400).json({ message: 'Wystąpił błąd!'});
      }
      res.json({ message: `Zmodyfikowano poziom mgły w dniu: ${req.params.date}` });
    });
  } else {
    return res.status(400).json({ message: 'Niepoprawny format daty, wymagany format: YYYY-mm-dd' });
  }
});
// Edycja fazy księżyca
router.patch('/:date/moon',async(req, res) => {
  if(isValidDate(req.params.date)) {
    if(!(await checkDayExist(req.params.date))) {
      return res.status(400).json({ message: `Data ${req.params.date} nie istnieje w bazie!`});
    }
    if(isNaN(req.body.moon)) {
      return res.status(400).json({ message: 'Wartość fazy księżyca musi być liczbą!'});
    } else if(req.body.moon > 9 || req.body.moon < 1) {
      return res.status(400).json({ message: 'Wartość fazy księżyca musi być w przedziale 1-9!'});
    }
    const sql = `UPDATE kalendarz SET faza_ksiezyca = ${req.body.moon} WHERE data = '${req.params.date}'`;
    db.query(sql, (error, result) => {
      if(error || result.affectedRows < 1) {
        return res.status(400).json({ message: 'Wystąpił błąd!'});
      }
      res.json({ message: `Zmodyfikowano wartość fazy księżyca w dniu: ${req.params.date}` });
    });
  } else {
    return res.status(400).json({ message: 'Niepoprawny format daty, wymagany format: YYYY-mm-dd' });
  }
});
// Edycja rodzaju opadu
router.patch('/:date/fall',async(req, res) => {
  if(isValidDate(req.params.date)) {
    if(!(await checkDayExist(req.params.date))) {
      return res.status(400).json({ message: `Data ${req.params.date} nie istnieje w bazie!`});
    }
    if(isNaN(req.body.fall)) {
      return res.status(400).json({ message: 'Wartość opadu musi być liczbą!'});
    } else if(req.body.fall > 4 || req.body.fall < 0) {
      return res.status(400).json({ message: 'Wartość opadu musi być w przedziale 0-4!'});
    }
    if(req.body.fall > 0 && await checkCloudExist(req.params.date)) {
      return res.status(400).json({ message: 'Opad nie może wystąpić przy bezchmurnym niebie!'});
    }
    else {
      const sql = `UPDATE kalendarz SET rodzaj_opadu = ${req.body.fall} WHERE data = '${req.params.date}'`;
      db.query(sql, (error, result) => {
        if(error || result.affectedRows < 1) {
          return res.status(400).json({ message: 'Wystąpił błąd!'});
        }
        res.json({ message: `Zmodyfikowano wartość opadu w dniu: ${req.params.date}` });
      });
    }
  } else {
    return res.status(400).json({ message: 'Niepoprawny format daty, wymagany format: YYYY-mm-dd' });
  }
});
// Sprawdzenie czy dany dzień jest w bazie
function checkDayExist(date) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT DATE_FORMAT(data, '%Y-%m-%d') data FROM kalendarz WHERE data = '${date}'`;
    db.query(sql, (error, result) => {
      if(error || result.length < 1) {
        resolve(false);
      }
      resolve(true);
    });
  });
}
// Sprawdzenie zachmurzenia
function checkCloudExist(date) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT zachmurzenie FROM kalendarz WHERE data = '${date}'`;
    db.query(sql, (error, result) => {
      if(JSON.parse(JSON.stringify(result))[0].zachmurzenie > 0) {
        resolve(false);
      }
      resolve(true);
    });
  });
}
// Sprawdzenie poprawności formatu daty
function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!dateString.match(regEx)) return false;  // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString;
}

module.exports = router; 
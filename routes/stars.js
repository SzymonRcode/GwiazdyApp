const express = require('express');
const router = express.Router();
const moment = require('moment');
const db = require('../connect');
const helper = require('../helpers/db.helper');

// Wyświetlenie dostępnych gwiazd
router.get('/', (req, res) => {
  const sql = `SELECT id, nazwa, status, pozycja_x, pozycja_y FROM gwiazdy`;
  db.query(sql, (error, result) => {
    if(error) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    } else if(result.length < 1) {
      return res.status(400).json({ message: 'Brak danych w tabeli gwiazdy!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Wyświetlenie gwiazdy po id
router.get('/:id', async (req, res) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID gwiazdy musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  const sql = `SELECT * FROM gwiazdy where id = ${req.params.id}`;
  db.query(sql, (error, result) => {
    if(error || result.length < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Zmiana statusu gwiazdy
router.post('/:id/toggle', async (req, res) =>{
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID gwiazdy musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  const sql = `UPDATE gwiazdy SET status = !status WHERE id = ${req.params.id}`;
  db.query(sql, async (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json(await helper.stars.getStatus(req.params.id));
  });
});
// Edycja gwiazdy po id
router.patch('/:id', async (req, res) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID gwiazdy musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  if(req.body.name == "" || req.body.description == "" || req.body.photo_link == "" || req.body.position_x == "" || req.body.position_y == "" || req.body.name == null || req.body.description == null || req.body.photo_link == null|| req.body.position_x == null|| req.body.position_y == null ){
    return res.status(400).json({ message: 'Należy podać wszystkie parametry!'});
  }
  if(isNaN(req.body.position_x) || isNaN(req.body.position_y)) {
    return res.status(400).json({ message: 'Pozycje muszą być w formie liczbowej!'});
  }
  if(req.body.position_x < 0 || req.body.position_x > 2000 || req.body.position_y < 0 || req.body.position_y > 2000){
    return res.status(400).json({ message: 'Pozycje muszą być w przedziale {0, 2000}! '});
  }
  if(await helper.stars.checkIfExistsByNameAndId(req.body.name, req.params.id)){
    return res.status(400).json({ message: `Gwiazda nie może mieć tej samej nazwy!`});
  }
  const sql = `UPDATE gwiazdy SET ? 
  WHERE id = ?`;
  const params = {
    nazwa: req.body.name,
    opis: req.body.description,
    link_zdjecie: req.body.photo_link,
    pozycja_x: req.body.position_x,
    pozycja_y: req.body.position_y
  };
  db.query(sql, [params, req.params.id], (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Zmodyfikowano dane gwiazdy o ID: ${req.params.id}` });
  });
});
// Wyświetlenie konstelacji po id gwiazdy
router.get('/:id/constellation', async (req,res ) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID gwiazdy musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  const sql = `SELECT k.id, k.nazwa FROM konstelacje_gwiazdy kg join konstelacje k on kg.id_konstelacji = k.id WHERE kg.id_gwiazdy = ${req.params.id}`;
  db.query(sql, (error, result) => {
    if(error) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    }else if(result.length < 1) {
      return res.status(400).json({ message: 'Gwiazda nie jest w żadnej konstelacji!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Dodawanie nowej gwiazdy
router.put('/', async (req, res) => {
  if(req.body.name == "" || req.body.description == "" || req.body.photo_link == "" || req.body.position_x == "" || req.body.position_y == "" || req.body.name == null || req.body.description == null || req.body.photo_link == null|| req.body.position_x == null|| req.body.position_y == null ){
    return res.status(400).json({ message: 'Należy podać wszystkie parametry!'});
  }
  if(isNaN(req.body.position_x) || isNaN(req.body.position_y)) {
    return res.status(400).json({ message: 'Pozycje muszą być w formie liczbowej!'});
  }
  if(req.body.position_x < 0 || req.body.position_x > 2000 || req.body.position_y < 0 || req.body.position_y > 2000){
    return res.status(400).json({ message: 'Pozycje muszą być w przedziale {0, 2000}! '});
  }
  if(await helper.stars.checkIfExistsByName(req.body.name)) {
      return res.status(400).json({ message: 'Gwiazda o takiej nazwie już istnieje!'});
  }
  const sql = `INSERT INTO gwiazdy (nazwa, opis, link_zdjecie, pozycja_x, pozycja_y) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.photo_link}', ${req.body.position_x}, ${req.body.position_y})`;
  db.query(sql, (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Dodano nową gwiazdę o nazwie ${req.body.name}!` });
  });
});
// Usunięcie gwiazdy z wpisami do tabeli konstelacje gwiazdy po ID
router.delete('/:id', async (req, res) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID gwiazdy musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  if(await helper.stars.checkIfStarExists(req.params.id)){
    const sql = `DELETE FROM konstelacje_gwiazdy WHERE id_gwiazdy=${req.params.id}`;
    db.query(sql, (error, result) => {
      if(error || result.affectedRows < 1) {
        return res.status(400).json({ message: 'Wystąpił błąd!'});
      }
    });
  }
  const sql = `DELETE FROM gwiazdy WHERE id=${req.params.id}`;
  db.query(sql, (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Usunięto gwiazdę o ID: ${req.params.id}!` });
  });
});
module.exports = router; 






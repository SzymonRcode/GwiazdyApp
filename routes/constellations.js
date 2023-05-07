const express = require('express');
const router = express.Router();
const moment = require('moment');
const db = require('../connect');
const helper = require('../helpers/db.helper');

// Wyświetlenie dostępnych konstelacji
router.get('/', (req, res) => {
  const sql = `SELECT id, nazwa FROM konstelacje`;
  db.query(sql, (error, result) => {
    if(error) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    } else if(result.length < 1) {
      return res.status(400).json({ message: 'Brak danych w tabeli konstelacje!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Wyświetlenie konstelacji po id
router.get('/:id', async (req, res) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID konstelacji musi być liczbą!'});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  const sql = `SELECT * FROM konstelacje where id = ${req.params.id}`;
  db.query(sql, (error, result) => {
    if(error || result.length < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Zmiana statusu wszystkich gwiazd w konstelacji
router.post('/:id_const/:status/setAll', async (req, res) =>{
  if(isNaN(req.params.id_const) || isNaN(req.params.status)) {
    return res.status(400).json({ message: 'Parametry muszą być w formie cyfrowej!'});
  }
  if(req.params.status > 1 || req.params.status < 0){
    return res.status(400).json({ message: 'Status musi być w przedziale {0, 1}!'});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id_const))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id_const} nie istnieje w bazie!`});
  }
  const sql = `UPDATE gwiazdy g JOIN konstelacje_gwiazdy kg on g.id = kg.id_gwiazdy SET g.status = ${req.params.status} WHERE kg.id_konstelacji = ${req.params.id_const}`;
  db.query(sql, (error, result) => {
    if(error) { 
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    if(result.affectedRows < 1){
      return res.status(400).json({message: 'Brak wystarczających danych w tabeli konstelacje gwiazdy / gwiazdy!'})
    }
    res.json({ message: `Zmieniono status na ${req.params.status} dla wszystkich gwiazd w konstelacji o ID: ${req.params.id_const}!` });
  });
});
// Edycja konstelacji po id
router.patch('/:id', async (req, res) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID konstelacji musi być liczbą!'});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  if(req.body.name == "" || req.body.description == "" || req.body.photo_link == "" || req.body.name == null || req.body.description == null || req.body.photo_link == null){
    return res.status(400).json({ message: 'Należy podać wszystkie parametry!'});
  }
  if(await helper.constellation.checkIfExistsByNameAndId(req.body.name, req.params.id)){
    return res.status(400).json({ message: `Konstelacja nie może mieć tej samej nazwy!`});
  }
  const sql = `UPDATE konstelacje SET ? 
  WHERE id = ?`;
  const params = {
    nazwa: req.body.name,
    opis: req.body.description,
    link_zdjecie: req.body.photo_link
  };
  db.query(sql, [params, req.params.id], (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Zmodyfikowano dane konstelacji o ID: ${req.params.id}` });
  });
});
// Dodawanie nowej konstelacji
router.put('/', async (req, res) => {
  if(req.body.name == "" || req.body.description == "" || req.body.photo_link == "" || req.body.name == null || req.body.description == null || req.body.photo_link == null){
    return res.status(400).json({ message: 'Należy podać wszystkie parametry!'});
  }
  if(await helper.constellation.checkIfExistsByName(req.body.name)) {
      return res.status(400).json({ message: 'Konstelacja o takiej nazwie już istnieje!'});
  }
  const sql = `INSERT INTO konstelacje (nazwa, opis, link_zdjecie) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.photo_link}')`;
  db.query(sql, (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Dodano nową konstelację o nazwie ${req.body.name}!` });
  });
});
// Usunięcie konstelacji wraz z wpisami w tabeli konstelacje gwiazdy po ID
router.delete('/:id', async (req, res) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID konstelacji musi być liczbą!'});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  if(await helper.constellation.checkIfConstellationExists(req.params.id)){
    const sql = `DELETE FROM konstelacje_gwiazdy WHERE id_konstelacji=${req.params.id}`;
    db.query(sql, (error, result) => {
      if(error || result.affectedRows < 1) {
        return res.status(400).json({ message: 'Wystąpił błąd!'});
      }
    });
  }
  const sql = `DELETE FROM konstelacje WHERE id=${req.params.id}`;
  db.query(sql, (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Usunięto konstelację o ID: ${req.params.id}!` });
  });
});
// Wyświetlenie gwiazd po id konstelacji
router.get('/:id/stars', async (req,res ) => {
  if(isNaN(req.params.id)) {
    return res.status(400).json({ message: 'ID konstelacji musi być liczbą!'});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id} nie istnieje w bazie!`});
  }
  const sql = `SELECT g.id, g.nazwa FROM konstelacje_gwiazdy kg join gwiazdy g on kg.id_gwiazdy = g.id WHERE kg.id_konstelacji = ${req.params.id}`;
  db.query(sql, (error, result) => {
    if(error) {
      return res.status(400).json({ message: 'Wystąpił błąd!' });
    }else if(result.length < 1) {
      return res.status(400).json({ message: 'W tej konstelacji nie ma żadnej gwiazdy!' });
    }
    const rows = JSON.parse(JSON.stringify(result));
    res.json(rows);
  });
});
// Dodanie gwiazdy do konstelacji
router.put('/:id_const/:id_star', async (req, res) =>{
  if(isNaN(req.params.id_const) || isNaN(req.params.id_star)) {
    return res.status(400).json({ message: 'ID musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id_star))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id_star} nie istnieje w bazie!`});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id_const))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id_const} nie istnieje w bazie!`});
  }
  if(await helper.constellation.checkIfStarAndConstellationExists(req.params.id_star,req.params.id_const)){
    return res.status(400).json({ message: `Do konstelacji nie można dodać tych samych gwiazd!`});
  }
  const sql = `INSERT INTO konstelacje_gwiazdy (id_konstelacji, id_gwiazdy) VALUES (${req.params.id_const}, ${req.params.id_star})`;
  db.query(sql, (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Dodano gwiazdę o ID: ${req.params.id_star} do konstelacji o ID: ${req.params.id_const}! ` });
  });
});
// Usunięcie gwiazdy z konstelacji
router.delete('/:id_const/:id_star', async (req, res) =>{
  if(isNaN(req.params.id_const) || isNaN(req.params.id_star)) {
    return res.status(400).json({ message: 'ID musi być liczbą!'});
  }
  if(!(await helper.checkIfStarExists(req.params.id_star))) {
    return res.status(400).json({ message: `Gwiazda o ID: ${req.params.id_star} nie istnieje w bazie!`});
  }
  if(!(await helper.constellation.checkIfExists(req.params.id_const))) {
    return res.status(400).json({ message: `Konstelacja o ID: ${req.params.id_const} nie istnieje w bazie!`});
  }
  if(!(await helper.constellation.checkIfStarAndConstellationExists(req.params.id_star,req.params.id_const))){
    return res.status(400).json({ message: `Brak danych w tabeli konstelacje gwiazdy!`});
  }
  const sql = `DELETE FROM konstelacje_gwiazdy WHERE id_konstelacji = ${req.params.id_const} and id_gwiazdy = ${req.params.id_star}`;
  db.query(sql, (error, result) => {
    if(error || result.affectedRows < 1) {
      return res.status(400).json({ message: 'Wystąpił błąd!'});
    }
    res.json({ message: `Usunięto gwiazdę o ID: ${req.params.id_star} z konstelacji o ID: ${req.params.id_const}! ` });
  });
});
module.exports = router; 
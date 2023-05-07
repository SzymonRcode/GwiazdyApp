const db = require('../connect');

const helper = {
  stars:{
    // Pobranie statusu gwiazdy
    getStatus: (id) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT status FROM gwiazdy where id = ${id}`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve({ message: 'Wystąpił błąd!' });
          }
          const row = JSON.parse(JSON.stringify(result));
          resolve(row);
        });
      });
    },
    // Sprawdzenie czy dana gwiazda jest w bazie po nazwie
    checkIfExistsByName: (name) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM gwiazdy where nazwa = '${name}'`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    // Sprawdzenie czy dana gwiazda jest w bazie po nazwie
    checkIfExistsByNameAndId: (name, id) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM gwiazdy where nazwa = '${name}' and id != '${id}'`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    // Sprawdzenie czy gwiazda jest w tabeli konstelacje gwiazdy
    checkIfStarExists: (id) =>{
      return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM konstelacje_gwiazdy where id_gwiazdy = ${id}`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    // Sprawdzenie czy jakakolwiek gwiazda istnieje
    checkIfAnyExists: () =>{
      return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM gwiazdy`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    }
  },
  constellation: {
    // Sprawdzenie czy dana konstelacja jest w bazie
    checkIfExists: (id) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM konstelacje where id = ${id}`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    // Sprawdzenie czy dana konstelacja jest w bazie po nazwie
    checkIfExistsByNameAndId: (name, id) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM konstelacje where nazwa = '${name}' and id != '${id}'`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    getStatus: (id) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT status FROM konstelacje_gwiazdy where id_gwiazdy = ${id}`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve({ message: 'Wystąpił błąd!' });
          }
          const row = JSON.parse(JSON.stringify(result));
          resolve(row);
        });
      });
    },
    // Sprawdzenie czy dana konstelacja jest w bazie po nazwie
    checkIfExistsByName: (name) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM konstelacje where nazwa = '${name}'`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    // Sprawdzenie czy w tabeli konstelacje_gwiazdy są już dane
    checkIfStarAndConstellationExists: (id_star, id_const) =>{
      return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM konstelacje_gwiazdy where id_gwiazdy = ${id_star} and id_konstelacji = ${id_const}`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    },
    // Sprawdzenie czy konstelacja jest w tabeli konstelacje gwiazdy
    checkIfConstellationExists: (id) =>{
      return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM konstelacje_gwiazdy where id_konstelacji = ${id}`;
        db.query(sql, (error, result) => {
          if(error || result.length < 1) {
            resolve(false);
          }
          resolve(true);
        });
      });
    }
  },
  // Sprawdzenie czy dana gwiazda jest w bazie
  checkIfStarExists: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT 1 FROM gwiazdy where id = ${id}`;
      db.query(sql, (error, result) => {
        if(error || result.length < 1) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }
};

module.exports = helper;
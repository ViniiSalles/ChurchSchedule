/* eslint-disable class-methods-use-this */
const connection = require('../dataBase/connection');

class EventsModel {
  listAll() {
    const sql = 'SELECT * FROM events';
    return new Promise((resolve, reject) => {
      connection.query(sql, {}, (error, res) => {
        if (error) {
          console.log('Erro ao listar todos');
          reject(error);
        }
        console.log('Deu bom listar todos');
        resolve(res);
      });
    });
  }
}

module.exports = new EventsModel();

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();

//CRUD
//Create read update delete

module.exports = new class Dbhandler{
  constructor(){
    this.db = new sqlite3.Database(dbFile);

  }

  addUser(u, p){
    return new Promise((rez, rej) => {
      const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      this.db.run(sql, [u, p], function(err){
        if(err) return rej(err)
        rez()
      })
    })


   }

   verifyUser(u, p){
    return new Promise((rez, rej) =>{
      const sql = 'SELECT * FROM users WHERE username = ? AND password = ?;';
      this.db.get(sql, [u, p], function(err, row){
        if(row) return rez()
        rej(err)
      })
    })
   }

   modifyUser(u, newP){
     return new Promise((rez, rej) => {
       const sql = 'UPDATE users SET password = ? WHERE username = ?;'
       this.db.run(sql, [newP, u], (err) => {
         if(err) return rej(err)
         rez()
       })
     })
   }

   showUsers(){
     this.db.all('SELECT * FROM users;', (err, rows) =>{
       if(err) return console.error(err)
       console.log(rows)
       return rows
     })
   }
}

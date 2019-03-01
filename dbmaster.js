const bcrypt = require('bcrypt');
const sRounds = 10;
const tPass = "Testing"

// init sqlite db
var fs = require('fs');
var dbFile = process.env.PATH_TO_DB;
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();


//CRUD
//Create read update delete

module.exports = new class Dbhandler{
  constructor(){
    this.db = new sqlite3.Database(dbFile);

  }


  addUser(u, p){
      const self = this;
      return new Promise((rez, rej) => {
        bcrypt.hash(p, sRounds, function(err, hash){
          if(err) return rej(err) //Login failed
          const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';

          self.db.run(sql, [u, hash], function(dberr){
              if(dberr) return rej(dberr) //DB problem
              rez()
            })
          })
      })
     }

   verifyUser(u, p){
    return new Promise((rez, rej) =>{
      const sql = 'SELECT * FROM users WHERE username = ?;';
      this.db.get(sql, [u], function(err, row){
        bcrypt.compare(p, row.password, function(err, res){
          if(res){
            return rez(row)
          }
          rej(err)
        })
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

   getUser(i){return new Promise((rez, rej)=>{
      const sql = "SELECT * FROM users WHERE id = ?";
      const self = this;
      self.db.get(sql, [i], (error, rows) => {
        return rez(rows)
        if(error){
          rej('Failed')
          console.log(error)
        }
      })
    })

   }
}

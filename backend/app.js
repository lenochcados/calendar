const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors')

app.use(cors({
  origin: 'http://127.0.0.1:5500', 
  credentials : true
}))

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(express.json({
  type: ['application/json', 'text/plain']
}))

app.get('/', (req, res) => {
  console.log('date', req.query.date)
  ret = selectRow(req.query.date)
  console.log('ret', ret)
  res.send(ret)
  // return ret
})

app.post('/calc', (req, res) => {
  console.log(req.body)
  createRow(req.body)
  res.send('HTTP')
})

app.listen(3000, () => {
  console.log("Started on PORT 3000");
})


// sqlite

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./sqlite.db');

function createRow(note) {
  db.serialize(function () {

    db.run('CREATE TABLE IF NOT EXISTS calendar (notes TEXT, date TEXT)');
    var stmt = db.prepare('INSERT INTO calendar (notes, date) VALUES (?, ?)');
    stmt.run((note.note), (note.date));
    stmt.finalize();

    // db.each('SELECT rowid AS id, info FROM calendar', function(err, row) {
    //   console.log(row.id + ': ' + row.info);
    // });
  });
  db.run('DELETE FROM calendar WHERE rowid=3')
}

function selectRow(note) {
  let result = {}
  db.all(`SELECT * FROM calendar WHERE date LIKE '%${note}'`, (err, row) => {
    result.data = row;
    console.log('row', typeof row);
  })
  console.log('result', result)
  return result
}
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use('/', express.static('../front'));

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(express.json({
  type: ['application/json', 'text/plain']
}))

app.get('/notes', (req, res) => {
  let result
  result = selectRow(req.query.date, res)
})

app.post('/calc', (req, res) => {
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
    db.run('CREATE TABLE IF NOT EXISTS calendar (notes TEXT, date TEXT NOT NULL PRIMARY KEY)');
    var stmt = db.prepare('INSERT OR REPLACE INTO calendar (notes, date) VALUES (?, ?)');
    stmt.run((note.note), (note.date));
    stmt.finalize();

    // db.each('SELECT rowid AS id, info FROM calendar', function(err, row) {
    //   console.log(row.id + ': ' + row.info);
    // });
  });
  db.run('DELETE FROM calendar WHERE rowid=3')
}

function selectRow(note, response) {
  let result = {}
  db.all(`SELECT * FROM calendar WHERE date LIKE '%${note}'`, (err, row) => {
    result.data = row;
    response.json(result.data);
  })
  return result
}
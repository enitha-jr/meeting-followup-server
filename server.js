const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'enithaJR',
    database: 'meeting'
});

db.connect((err) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log('Connected to database');
    }
});

app.get('/meetings/upcoming', (req, res) => {
    const sql = "select * from meetings where status='ongoing' ";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
})
app.get('/meetings/completed', (req, res) => {
    const sql = "select * from meetings where status='completed' ";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
})

app.get('/meetings/:id', (req, res) => {
    const sql = "SELECT * FROM meetings WHERE id = ?";
    const values = [req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.post('/newmeeting/post', (req, res) => {
    const sql = "insert into meetings (followup,title,meetid,dept,host,date,time,venue,description,members) values (?,?,?,?,?,?,?,?,?,?)";
    const values = [req.body.followup, req.body.title, req.body.meetid, req.body.dept, req.body.host, req.body.date, req.body.time, req.body.venue, req.body.desc, req.body.members];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});

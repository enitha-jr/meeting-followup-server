const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dharnesh10',
    database: 'meetminutes'
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

app.put('/meetings/:meetingid/change-complete', (req, res) => {
    const sql = "update meetings set status='completed' where meetingid = ?";
    const values = [req.params.meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.get('/meetings/:meetingid/details', (req, res) => {
    const sql = "SELECT * FROM meetings WHERE meetingid = ?";
    const values = [req.params.meetingid];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});
app.get('/meetings/:meetingid/minutes', (req, res) => {
    const sql = "SELECT * FROM minutes WHERE meetingid = ?";
    const values = [req.params.meetingid];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.get('/meetings/:meetingid/tasks', (req, res) => {
    const sql = "SELECT * FROM tasks WHERE meetingid = ?";
    const values = [req.params.meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});




app.post('/newmeeting', (req, res) => {
    const sql = "insert into meetings (followup,title,mid,dept,host,date,time,venue,description,members) values (?,?,?,?,?,?,?,?,?,?)";
    const values = [req.body.followup, req.body.title, req.body.mid, req.body.dept, req.body.host, req.body.date, req.body.time, req.body.venue, req.body.desc, req.body.members];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.post('/meetings/:meetingid/minutes', (req, res) => {
    const { meetingid } = req.params;
    const { minute } = req.body;
    const sql = "insert into minutes (meetingid,minute) values (?,?)";
    const values = [meetingid,minute];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

app.post('/meetings/:meetingid/tasks', (req, res) => {
    const {meetingid} = req.params;
    const { minute, task, desc, assign, date } = req.body;
    const selectQuery = "select minuteid from minutes where minute = ? and meetingid = ?";
    const insertQuery = "insert into tasks (meetingid,minuteid,task,description,assigned,date) values (?,?,?,?,?,?)";

    db.query(selectQuery, [minute, meetingid], (err, result) => {
        if(err){
            console.log(err.message);
        }
        if (result.length === 0) {
            res.status(404).send("Minute not found for the given meeting");
            return;
        }
        const minuteid = result[0].minuteid;
        const values = [meetingid, minuteid, task, desc, assign, date];
        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result);
                res.send(result); 
            }
        });
    });
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});

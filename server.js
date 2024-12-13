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

app.get('/users', (req, res) => {
    const sql = "select * from users";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    }); 
})

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

app.get('/meetings/nextmid', (req, res) => {
    const sql = "select max(mid)+1 as nextmid from meetings";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.json({ nextmid: result[0].nextmid });
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

app.get('/meetings/:meetingid/members', (req, res) => {
    try{
        const sql = "SELECT * FROM attendance WHERE meetingid = ?";
        const values = [req.params.meetingid];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                res.send(result);
            }
        });
    }catch(error){
        console.log(error.message);
    }
})

app.post('/newmeeting', (req, res) => {
    try {
        const { followup, title, mid, dept, host, date, time, venue, desc, members } = req.body;
        const meetingsquery = "insert into meetings (followup,title,mid,dept,host,date,time,venue,description,members) values (?,?,?,?,?,?,?,?,?,?)";
        const meetingvalues = [followup, title, mid, dept, host, date, time, venue, desc, JSON.stringify(members)];
        db.query(meetingsquery, meetingvalues, (err, result) => {
            if (err) {
                console.log(err.message);
                res.status(500).send(err.message);
            } else {
                console.log(result);
                const meetingid = result.insertId;
                const membersvalues = members.map(member => [member,meetingid]);
                const membersquery = "insert into attendance (staffname,meetingid) values ?";
                db.query(membersquery, [membersvalues], (err, result) => {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send(err.message);
                    } else {
                        // console.log(result);
                        res.send(result);
                    }
                });
            }
        });
        
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/meetings/:meetingid/minutes', (req, res) => {
    const { meetingid } = req.params;
    const { minute } = req.body;
    const sql = "insert into minutes (meetingid,minute) values (?,?)";
    const values = [meetingid, minute];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            // console.log(result);
            res.send(result);
        }
    });
});

app.post('/meetings/:meetingid/tasks', (req, res) => {
    const { meetingid } = req.params;
    const { minute, task, desc,assignby, assignto, date } = req.body;
    const selectQuery = "select minuteid from minutes where minute = ? and meetingid = ?";
    const insertQuery = "insert into tasks (meetingid,minuteid,task,description,assignby,assignto,date) values (?,?,?,?,?,?,?)";

    db.query(selectQuery, [minute, meetingid], (err, result) => {
        if (err) {
            console.log(err.message);
        }
        if (result.length === 0) {
            res.status(404).send("Minute not found for the given meeting");
            return;
        }
        const minuteid = result[0].minuteid;
        const values = [meetingid, minuteid, task, desc,assignby, assignto, date];
        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                // console.log(result);
                res.send(result);
            }
        });
    });
});

app.post('/meetings/:meetingid/attendance', (req, res) => {
    try{
        const {meetingid} = req.params;
        const {attendance} = req.body;
        const sql ="update attendance set status=case when status=0 THEN 1 ELSE 0 end where meetingid = ? and staffname = ?";
        const values = [meetingid,attendance];
        db.query(sql,values,(err,result)=>{
            if(err){
                console.log(err.message);
            }else{
                console.log(result);
                res.send("updated");
            }
        });
    }catch{
        console.log(error.message);
    }
});

app.put('/meetings/updatemeetingdetails/:meetingid', (req, res) => {
    const sql = 'UPDATE meetings SET followup = ?, title = ?, mid = ?, dept = ?, host = ?, date = ?, time = ?, venue = ?, description = ?, members = ? WHERE meetingid = ?'
    const meetingid = req.params.meetingid
    const updatedvalues = [req.body.followup, req.body.title, req.body.mid, req.body.dept, req.body.host, req.body.date, req.body.time, req.body.venue, req.body.desc, JSON.stringify(req.body.members), meetingid];
    db.query(sql, updatedvalues, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send("updated meeting details")
        }
    })
})

app.listen(5000, () => {
    console.log('Server started on port 5000');
});

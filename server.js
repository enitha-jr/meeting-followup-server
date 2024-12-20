const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("17992968099-bg7q3k8s23iphc611hn6aiv23e6rpcqq.apps.googleusercontent.com");
app.use(cors());
app.use(express.json());
const nodemailer = require('nodemailer');

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

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: "enitha.it23@bitsathy.ac.in",
        pass: ''
    }
});

app.get('/users', (req, res) => {
    const sql = "select * from users";
    db.query(sql,(err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    }); 
})

app.post('/users', (req, res) => {
    const {user,pass} = req.body;
    const sql = "select * from users where username = ? and password = ?";
    const values = [user,pass];
    db.query(sql,values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    }); 
})

app.post('/meetings/upcoming', (req, res) => {
    const {username} = req.body;
    const sql = `select * from meetings where status='ongoing' and host = ? OR minutetaker = ? OR JSON_CONTAINS(members, '"${username}"')`;
    const values = [username,username];
    db.query(sql, values,(err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
})

app.post('/meetings/completed', (req, res) => {
    const {username} = req.body;
    const sql = `select * from meetings where status='completed' and host = ? OR minutetaker = ? OR JSON_CONTAINS(members, '"${username}"')`;
    const values =[username];
    db.query(sql,values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
})

app.post('/meetings/mymeeting', (req, res) => {
    const { host } = req.body;
    const sql = "select * from meetings where host= ?";
    const values = [host];
    db.query(sql,values, (err, result) => {
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

app.get('/meetings/:username', (req, res) => {
    const { username } = req.params;
    const sql = `SELECT * FROM meetings WHERE host = ? OR JSON_CONTAINS(members, '"${username}"')`;
    const values = [username];
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

app.get('/meetings/:meetingid/taskminutes', (req, res) => {
    const sql = "SELECT * FROM minutes WHERE meetingid = ? and istask = 1";
    const values = [req.params.meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(result);    
            res.send(result);
        }
    });
});

app.get('/meetings/:meetingid/notaskminutes', (req, res) => {
    const sql = "SELECT * FROM minutes WHERE meetingid = ? and istask = 0";
    const values = [req.params.meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.get('/meetings/:meetingid/notassigned', (req, res) => {
    const sql = "SELECT * FROM minutes WHERE meetingid = ? and istask = 1 and minuteid not in (select minuteid from tasks)";
    const values = [req.params.meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.get('/meetings/:meetingid/alltasks', (req, res) => {
    const sql = "SELECT * FROM tasks WHERE meetingid = ? ORDER BY CASE WHEN status = 'assigned' THEN 1 WHEN status = 'pending' THEN 2 WHEN status = 'completed' THEN 3 ELSE 4 END, date ASC";
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
        const { followup, title, mid, dept, host, date, time, venue, desc, members, minutetaker } = req.body;

        // Insert into meetings table
        const meetingsquery = `
            INSERT INTO meetings 
            (followup, title, mid, dept, host, date, time, venue, description, members, minutetaker) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const meetingvalues = [followup, title, mid, dept, host, date, time, venue, desc, JSON.stringify(members), minutetaker];
        db.query(meetingsquery, meetingvalues, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            }

            const meetingid = result.insertId;

            // Insert into attendance table
            const membersvalues = members.map(member => [member, meetingid]);
            const membersquery = "INSERT INTO attendance (staffname, meetingid) VALUES ?";
            db.query(membersquery, [membersvalues], (err) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send(err.message);
                }
                // const membersQuery = "SELECT email FROM users WHERE username IN (?)";
                //     db.query(membersQuery, [members], (err, membersResult) => {
                //         if (err) {
                //             console.log(err.message);
                //             return res.status(500).send(err.message);
                //         }
                //         res.send('Meeting created');
                //         const memberEmails = membersResult.map(row => row.email);
                //         const mailOptions = {
                //             from: "enitha.it23@bitsathy.ac.in",
                //             to: memberEmails.join(','),
                //             subject: `Meeting Invitation: ${title}`,
                //             text: `
                //                 You are invited to a meeting with the following details:
                                
                //                 Title: ${title}
                //                 Date: ${date}
                //                 Time: ${time}
                //                 Venue: ${venue}
                //                 Description: ${desc}
                //                 Minutetaker: ${minutetaker}

                //                 Please make sure to attend.

                //                 Regards,
                //                 ${host}
                //             `
                //         };
                //         // Send emails
                //         transporter.sendMail(mailOptions, (err, info) => {
                //             if (err) {
                //                 console.log(err.message);
                //                 return res.status(500).send('Failed to send emails.');
                //             }

                //             console.log('Emails sent: ', info.response);
                //         });
                //     });
            });
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/requestmeeting', (req, res) => {
    const { followup, title, mid, dept, host, date, time, venue, desc, members, minutetaker } = req.body;

        // Insert into meetings table
        const meetingsquery = `
            INSERT INTO requests 
            (followup, title, mid, dept, host, date, time, venue, description, members, minutetaker) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const meetingvalues = [followup, title, mid, dept, host, date, time, venue, desc, JSON.stringify(members), minutetaker];
        db.query(meetingsquery, meetingvalues, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            }else{
                res.send('Meeting requested');
            }
        });
    
})


app.post('/meetings/:meetingid/minutes', (req, res) => {
    const { meetingid } = req.params;
    const { minute,istask,mid} = req.body;
    console.log(mid);
    const sql = "insert into minutes (meetingid,minute,istask,mid) values (?,?,?,?)";
    const values = [meetingid, minute,istask,mid];
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
    const { minute, task, desc, assignby, assignto, date } = req.body;
    const selectQuery = "SELECT minuteid, mid FROM minutes WHERE minute = ? AND meetingid = ?";
    const updateQuery = "UPDATE minutes SET status = 'assigned' WHERE minuteid = ?";
    const insertQuery = "INSERT INTO tasks (meetingid, minuteid, task, description, assignby, assignto, date, mid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(selectQuery, [minute, meetingid], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Error fetching minute.");
        }
        if (result.length === 0) {
            res.status(404).send("Minute not found for the given meeting");
            return;
        }
        const minuteid = result[0].minuteid;
        const mid = result[0].mid;
        const values = [meetingid, minuteid, task, desc, assignby, assignto, date, mid];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Error inserting task.");
            }
            res.send("task assigned");
            const mailQuery = "SELECT email FROM users WHERE username IN (?, ?)";
            db.query(mailQuery, [assignby, assignto], (err, membersResult) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send("Error fetching emails.");
                }
                
                if (membersResult.length === 0) {
                    return res.status(404).send("Emails not found for the given users.");
                }

                const memberEmails = membersResult.map(row => row.email).join(',');

                // Set up the mail options
                // const mailOptions = {
                //     from: "enitha.it23@bitsathy.ac.in",  // Replace with your email
                //     to: memberEmails,  // Joining multiple email addresses
                //     subject: `TASK ASSIGNED: ${task}`,
                //     text: `
                //         TASK ASSIGNED:
                //         Task: ${task}
                //         Assigned By: ${assignby}
                //         Assigned To: ${assignto}
                //         Description: ${desc}
                //         Due Date: ${date}

                //         Regards,
                //         ${assignby}
                //     `
                // };
                // transporter.sendMail(mailOptions, (err, info) => {
                //     if (err) {
                //         console.log(err.message);
                //         return res.status(500).send('Failed to send emails.');
                //     }
                //     console.log('Emails sent: ', info.response);
                // });
            });
        });
        db.query(updateQuery, [minuteid], (err, result) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Error updating minute status.");
            }
        });
    });
});

app.put('/meetings/attendance', (req, res) => {
    try{
        const {attendanceid} = req.body;
        console.log("Received attendanceid:", attendanceid);
        const sql ="update attendance set status=case when status=0 THEN 1 ELSE 0 end where attendanceid = ? ";
        const values = [attendanceid];
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

app.put('/meetings/:meetingid/minutes/:minuteid', (req, res) => {
    const sql = "update minutes set minute = ? where meetingid = ? and minuteid = ?";
    const values = [req.body.minute, req.params.meetingid, req.params.minuteid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    })
})

app.put('/meetings/updatetasks/:meetingid', (req, res) => {
    const sql = "update tasks set task = ?, description = ?, assignby = ?, assignto = ?, date = ? where meetingid = ?";
    const values = [req.body.task, req.body.desc, req.body.assignby, req.body.assignto, req.body.date, req.params.meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    })
})

app.delete('/meetings/:meetingid/minutes/:minuteid', (req, res) => {
    const sql = "delete from minutes where meetingid = ? and minuteid = ?";
    const values = [req.params.meetingid, req.params.minuteid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
});

app.delete('/meetings/:meetingid/tasks/:taskid', (req, res) => {
    const sql = "delete from tasks where meetingid = ? and taskid = ?";
    const values = [req.params.meetingid, req.params.taskid]
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    });
})

app.post('/meetings/mytasks', (req, res) => {
    const {username} = req.body;
    const sql = "select * from tasks where assignto = ? ORDER BY CASE WHEN status = 'assigned' THEN 1 WHEN status = 'pending' THEN 2 WHEN status = 'completed' THEN 3 ELSE 4 END, date ASC";
    const values = [username];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            // console.log(result);
            res.send(result);
        }
    });
});

app.post('/meetings/assignedtasks', (req, res) => {
    const {username} = req.body;
    const sql = "select * from tasks where assignby = ? ORDER BY CASE WHEN status = 'pending' THEN 1 WHEN status = 'assigned' THEN 2 WHEN status = 'completed' THEN 3 ELSE 4 END, date ASC";
    const values = [username];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            // console.log(result);
            res.send(result);
        }
    });
});

app.put('/meetings/updatemytasks', (req, res) => {
    const {id}=req.body;
    const sql = "update tasks set status=case when status='assigned' THEN 'pending' ELSE 'assigned' end where taskid = ?";
    const values = [id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    })
})


app.put('/meetings/updateassignedtasks', (req, res) => {
    const {id}=req.body;
    const sql = "update tasks set status=case when status='pending' THEN 'completed' ELSE 'pending' end where taskid = ?";
    const values = [id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(result);
        }
    })
})

app.post('/meetings/:meetingid/tobediscussed/alltasks', (req, res) => {
    const { mid } = req.body;
    const {meetingid} = req.params;
    const sql = `
        SELECT * 
        FROM tasks 
        WHERE mid = ? 
        AND (
            status != 'completed' OR 
            (status = 'completed' AND meetingid = (
                SELECT MAX(meetingid) 
                FROM tasks 
                WHERE mid = ?
            ))
        )
        and meetingid != ?
        ORDER BY 
            CASE 
                WHEN status = 'assigned' THEN 1 
                WHEN status = 'pending' THEN 2 
                WHEN status = 'completed' THEN 3 
                ELSE 4 
            END, 
            date ASC
    `;
    const values = [mid, mid, meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('An error occurred while retrieving tasks.');
        } else {
            res.send(result);
        }
    });
});

app.post('/meetings/:meetingid/tobediscussed/notassigned', (req, res) => {
    const {mid} = req.body;
    const {meetingid} = req.params;
    const sql = "SELECT * FROM minutes WHERE mid=? and istask = 1 and minuteid not in (select minuteid from tasks) and meetingid != ?";
    const values = [mid,meetingid];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(mid);
            
            res.send(result);
        }
    });
})
app.post('/users/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "17992968099-bg7q3k8s23iphc611hn6aiv23e6rpcqq.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();

        // Check if user exists or create new user
        const user = { username: payload.name, email: payload.email }; // Mock user
        res.json(user);
    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(400).send('Invalid Google token');
    }
});
app.listen(5000, () => {
    console.log('Server started on port 5000');
});

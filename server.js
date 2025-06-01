const express = require('express')
const app = express();
const port = 3000;

// Enable CORS for your frontend origin
const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.json()); // for JSON
app.use(express.urlencoded({ extended: true })); // for form data

const connectToDatabase = require('./connection');

app.get('/config', (req, res) => {
    res.json({ apiBaseUrl: 'http://192.168.1.101:3000' }); // replace with your static IP
});

app.get('/', (request, res) => {
    res.send('This is the main Route');
});

app.post('/student', (request, res) => {
    const { studentName, studentAge, studentGrade } = request.body;
    const query = 'INSERT INTO students (name, age, grade) VALUES (?,?,?)';
    connectToDatabase.query(query, [studentName, studentAge, studentGrade], (err, results) => {
        if (err) {
            res.status(500).send({ error: 'There was a problem adding the student to the database.' });
        } else {
            res.status(201).send({ success: 'Successfully added a new student.' });
        }
    });
});


app.get('/students-list', (request, res) => {


    const countQuery = 'SELECT COUNT(*) AS total FROM students';

    connectToDatabase.query(countQuery, (err, countResults) => {
        if (err) {
            return res.status(500).send({ error: 'There was a problem fetching total count.' });
        }

        const totalStudents = countResults[0].total
        if (totalStudents > 0) {
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 5;
            //let offset = (page - 1) * limit;


            const maxPages = Math.ceil(totalStudents / limit);
            //Calculate the offset. Take into account the upper bound constraint
            const offset = (page > maxPages) ? (maxPages - 1) * limit : (page - 1) * limit;
            const dataQuery = `SELECT * FROM students LIMIT ${limit} OFFSET ${offset}`;

            connectToDatabase.query(dataQuery, (err, studentResults) => {
                if (err) {
                    return res.status(500).send({ error: 'There was a problem fetching student data.' });
                }

                res.json({
                    students: studentResults,
                    total: totalStudents
                });
            });
        }
        else {
            res.json({
                students: {},
                total: 0
            });
        }

    });
});


app.delete('/student-delete/:id', (request, res) => {
    const { id } = request.params;
    const query = 'DELETE FROM students WHERE id = ?';

    connectToDatabase.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send({ error: 'There was a problem deleting the student from the database.' });
        }
        else if (results.affectedRows === 0) {
            res.status(404).send({ error: 'Student not found.' });
        }
        else {
            res.status(201).send({ success: `Successfully deleted student ID ${id}.` });
        }
    });
});


app.get('/student-get/:id', (request, res) => {
    const { id } = request.params;
    const query = 'SELECT * FROM students WHERE id = ?';
    // res.status(202).send({ query: query, id: id });?
    connectToDatabase.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send({ error: 'There was a problem deleting the student from the database.' });
        }
        else if (results.affectedRows === 0) {
            res.status(404).send({ error: 'Student not found.' });
        }
        else {
            res.status(201).send({ studentData: results[0] });
        }
    });
});

app.put('/student-update', (request, res) => {
    const { id, name, age, grade } = request.body;
    const query = 'UPDATE students SET name = ?, age = ?, grade = ? WHERE id = ?';

    connectToDatabase.query(query, [name, age, grade, id], (err, results) => {
        if (err) {
            res.status(500).send({ error: 'There was a problem updating the student to the database.' });
        } else {
            res.status(201).send({ success: `Successfully updated the new student: ${name}` });
        }
    });
});

app.get('/students-count', (request, res) => {

    const countQuery = 'SELECT COUNT(*) AS total FROM students';
    connectToDatabase.query(countQuery, (err, countResults) => {
        if (err) {
            return res.status(500).send({ error: 'There was a problem fetching total count.' });
        }

        const totalStudents = countResults[0].total
        res.json({
            total: totalStudents
        });
    });
});


// app.delete('/student-delete/:id', async (req, res) => {
//     const studentId = parseInt(req.params.id);
//     res.status(200).json({ message: `Student ID: ${studentId}` });
//     if (isNaN(studentId)) {
//         return res.status(400).json({ error: 'Invalid student ID.' });
//     }

//     try {
//         const [result] = await connectToDatabase.query('DELETE FROM students WHERE id = ?', [studentId]);

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: 'Student not found.' });
//         }

//         res.status(200).json({ message: 'Student deleted successfully.' });
//     } catch (err) {
//         res.status(500).json({ error: 'Database error.' });
//     }
// });

app.listen(port, () => {
    console.log(`This server is listening on port ${port}`);
});

// app.get('/customers', (request, res) => {
//     connectToDatabase.query('SELECT * FROM customers', (err, results) => {
//         if (err) {
//             res.status(500).json({ error: 'There was an error obtaining customers' });
//         } else {
//             res.json(results);
//         }
//     });
//     // res.send('This is the main Route');
// });

// app.get('/orders', (request, res) => {
//     connectToDatabase.query('SELECT * FROM orders', (err, results) => {
//         if (err) {
//             res.status(500).json({ error: 'There was an error obtaining orders' });
//         } else {
//             res.json(results);
//         }
//     });
//     // res.send('This is the main Route');
// });

// app.get('/order-items', (request, res) => {
//     connectToDatabase.query('SELECT * FROM order_items', (err, results) => {
//         if (err) {
//             res.status(500).json({ error: 'There was an error obtaining order-items' });
//         } else {
//             res.json(results);
//         }
//     });
//     // res.send('This is the main Route');
// });

// app.get('/sample', (request, res) => {
//     res.send('This is the sample route!');
// });

// app.get('/employees', (request, res) => {
//     connectToDatabase.query('SELECT * FROM employees', (err, results) => {
//         if (err) {
//             res.status(500).json({ error: 'There was an error obtaining employees' });
//         } else {
//             res.json(results);
//         }
//     });
//     // res.send('This is the main Route');
// });

// app.get('/employees/:id', (request, res) => {
//     connectToDatabase.query(`SELECT * FROM Employees WHERE FirstName='${request.params.id}'`, (err, results) => {
//         if (err) {
//             res.status(500).json({ error: 'There was an error obtaining Employees' });
//         } else {
//             res.json(results);
//         }
//     });
// });

// app.post('/employees', (request, res) => {
//     const { FirstName, LastName, BirthDate, Position, Salary } = request.body;
//     console.log("FirstName: ", FirstName);
//     const query = 'INSERT INTO employees (FirstName, LastName, BirthDate, Position, Salary) VALUES (?,?,?,?,?)';
//     connectToDatabase.query(query, [FirstName, LastName, BirthDate, Position, Salary], (err, results) => {
//         if (err) {
//             res.status(500).send({ error: 'There was a problem adding the employee to the database.' });
//         } else {
//             res.status(201).send('Successfully added a new employee.');
//         }
//     });
// });

// app.put('/employees/:id', (request, res) => {
//     const { id } = request.params;
//     const { FirstName, LastName, BirthDate, Position, Salary } = request.body;
//     const query = 'UPDATE employees SET FirstName = ?, LastName = ?, BirthDate = ?, Position = ?, Salary = ? WHERE EmployeeID = ?';

//     connectToDatabase.query(query, [FirstName, LastName, BirthDate, Position, Salary, id], (err, results) => {
//         if (err) {
//             res.status(500).send({ error: 'There was a problem updating the employee to the database.' });
//         }
//         else if (results.affectedRows === 0) {
//             res.status(404).send('Employee not found.');
//         }
//         else {
//             res.status(201).send(`Successfully updated an employee ${FirstName}.`);
//         }
//     });
// });


// app.delete('/employees/:id', (request, res) => {
//     const { id } = request.params;
//     const query = 'DELETE FROM Employees WHERE EmployeeID = ?';

//     connectToDatabase.query(query, [id], (err, results) => {
//         if (err) {
//             res.status(500).send({ error: 'There was a problem deleting the employee from the database.' });
//         }
//         else if (res.affectedRows === 0) {
//             res.status(404).send('Employee not found.');
//         }
//         else {
//             res.status(201).send(`Successfully deleted employee ID ${id}.`);
//         }
//     });
// });


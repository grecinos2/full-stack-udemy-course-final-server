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


app.listen(port, () => {
    console.log(`This server is listening on port ${port}`);
});


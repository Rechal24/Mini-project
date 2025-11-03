const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  

const app = express();
const port = 5000;

app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// File path for storing student data
const dataFilePath = path.join(__dirname, 'studentData.json');


app.get('/', (req, res) => {   
    return res.json('Server API is running...!');
});

// GET endpoint to fetch all students
app.get('/api/getstudents', (req, res) => {
  fs.readFile(dataFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read student data.' });
    }

    if (!data) {
      return res.json([]);
    }

    try {
      const students = JSON.parse(data);
      return res.json(students);
    } catch (err) {
      return res.status(500).json({ error: 'Error parsing student data.' });
    }
  });
});

//---------------Update API-------------------
app.put('/api/editstudent/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const updatedData = req.body; 

  fs.readFile(dataFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read student data.' });
    }

    let students = [];
    try {
      students = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: 'Error parsing student data.' });
    }

    console.log("Students before editing details from email id :- ", students);
    const index = students.findIndex(s => s.email.toLowerCase() === email);

    if (index === -1) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    students[index] = {
      ...students[index],
      ...updatedData
    };

    fs.writeFile(dataFilePath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to update student data.' });
      }
      res.json({ message: `Student with email ${email} updated successfully.`, student: students[index] });
    });
  });
});

//----------------Delete APi-------
app.delete('/api/deletestudent/:email', (req, res) => {
  const email = req.params.email.toLowerCase();

  fs.readFile(dataFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read student data.' });
    }

    let students = [];
    if (data) {
      try {
        students = JSON.parse(data);
      } catch {
        return res.status(500).json({ error: 'Error parsing student data.' });
      }
    }

    // Filter out the student(s) with the given email
    const updatedStudents = students.filter(s => s.email.toLowerCase() !== email);


    // If no change, student not found
    if (updatedStudents.length === students.length) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Write updated data back to the file
    fs.writeFile(dataFilePath, JSON.stringify(updatedStudents, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to update student data.' });
      }
      res.json({ message: `Student with email ${email} deleted successfully.` });
    });
  });
});

// POST endpoint to submit student data
app.post('/api/students', (req, res) => {
  const newStudent = req.body;

  // Read the existing data from the file
  fs.readFile(dataFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read data' });
    }

    let students = [];
    try {
      students = data ? JSON.parse(data) : [];
    } catch (err) {
      students = [];
    }

    students.push(newStudent);

    console.log("Students data before stringify :- ", students);

    fs.writeFile(dataFilePath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to save student data.' });
      }
      res.status(201).json(newStudent); 
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

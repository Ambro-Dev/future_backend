const Student = require('../model/Student');

const getAllStudents = async (req, res) => {
    const students = await Student.find();
    if (!students) return res.status(204).json({ 'message': 'No students found.' });
    res.json(students);
}

const createNewStudent = async (req, res) => {
    if (!req?.body?.name || !req?.body?.surname || !req.body?.studentNumber) {
        return res.status(400).json({ 'message': 'First and last names are required' });
    }

    try {
        const result = await Student.create({
            name: req.body.name,
            surname: req.body.surname,
            studentNumber: req.body.studentNumber
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateStudent = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const student = await Student.findOne({ _id: req.body.id }).exec();
    if (!student) {
        return res.status(204).json({ "message": `No student matches ID ${req.body.id}.` });
    }
    if (req.body?.name) student.firstname = req.body.name;
    if (req.body?.surname) student.lastname = req.body.surname;
    const result = await student.save();
    res.json(result);
}

const deleteStudent = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Student ID required.' });

    const student = await Student.findOne({ _id: req.body.id }).exec();
    if (!student) {
        return res.status(204).json({ "message": `No student matches ID ${req.body.id}.` });
    }
    const result = await student.deleteOne(); //{ _id: req.body.id }
    res.json(result);
}

const getStudent = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Student ID required.' });

    const student = await Student.findOne({ _id: req.params.id }).exec();
    if (!student) {
        return res.status(204).json({ "message": `No student matches ID ${req.params.id}.` });
    }
    res.json(student);
}

module.exports = {
    getAllStudents,
    createNewStudent,
    updateStudent,
    deleteStudent,
    getStudent
}
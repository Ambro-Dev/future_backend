const Lesson = require("../model/Lesson")


const createLesson = async (name, course, start, end) => {
    const lesson = new Lesson({
        name: name,
        courseId: course,
        start: start,
        end: end
    });

    await lesson.save();

    return lesson;
}

module.exports = { createLesson };
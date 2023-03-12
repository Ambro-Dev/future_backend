const Event = require("../model/Event")


const createEvent = async (name, description, start, end, url) => {
    const event = new Event({
        name: name,
        description: description,
        url: url,
        start: start,
        end: end
    });

    await event.save();

    return event;
}

module.exports = { createEvent };
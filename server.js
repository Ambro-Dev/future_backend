require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const Message = require("./model/Message");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const User = require("./model/User");
const Conversation = require("./model/Conversation");
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 3500;
const socketIOPort = process.env.SOCKETIO_PORT || 4000;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.use("/", require("./routes/root"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);
app.use("/groups", require("./routes/api/groups"));
app.use("/users", require("./routes/api/users"));
app.use("/courses", require("./routes/api/courses"));
app.use("/conversations", require("./routes/api/conversations"));
app.use("/messages", require("./routes/api/messages"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  http.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
  });
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  Conversation.find({}, (err, conversations) => {
    if (err) throw err;

    socket.emit("conversationList", conversations);
  });

  User.find({}, (err, users) => {
    if (err) throw err;

    socket.emit("userList", users);
  });

  socket.on("create-conversation", (data) => {
    // Create a new conversation conversation
    const conversation = new Conversation({
      name: data.name,
      members: data.members,
    });

    conversation
      .save()
      .then(() => {
        socket.emit("new-conversation", conversation);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on('join-conversation', ({ conversationId }) => {
    socket.join(conversationId);

    // Send the messages in the conversation to the user
    Message.find({ conversation: conversationId }, (err, messages) => {
      if (err) throw err;

      socket.emit('conversation-messages', messages);
    });
  });

  socket.on("leave-conversation", (data) => {
    // Remove the user from the conversation's user list
    console.log(`User ${data.user} left conversation ${data.conversation}`);
    try {
      socket.to(data.conversation).emit("user-left", { user: data.user });
    } catch (err) {
      console.error(err);
    }
    // Leave the user from the conversation
    socket.leave(data.conversation);
  });

  socket.on("send-message", (data) => {
    const message = new Message({
      sender: data.sender,
      conversation: data.conversation,
      text: data.text,
    });
    message.save().then(() => {
      socket.to(data.conversation).emit("new-message", message);
    });
  });

  socket.on("receive-message", (data) => {
    // Find messages in MongoDB for this user
    Message.find({ receiver: data.receiver })
      .then((messages) => {
        // Send messages directly to this user
        socket.emit("messages", messages);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const express = require("express");
const connectDB = require("./config/db");
const app = express();
connectDB();
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("API running");
});
// Init Middle (body parser it is integrated in express so don't need to require)
app.use(express.json({ extended: false }));
// Define route
app.use("/api/users", require("./routes/api/users"));
app.use("/api/users", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/users", require("./routes/api/posts"));

app.listen(PORT, () => console.log(`server started on port ${PORT}`));

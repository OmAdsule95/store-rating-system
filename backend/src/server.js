require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const storeRoutes = require("./routes/store.routes");
const ratingRoutes = require("./routes/rating.routes");
const ownerRoutes = require("./routes/owner.routes"); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner", ownerRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Store Rating API is running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
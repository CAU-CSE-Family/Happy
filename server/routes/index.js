const authRoutes = require("./auth");

const router = (app) => {
  app.use("/auth", authRoutes);
}

module.exports = router;

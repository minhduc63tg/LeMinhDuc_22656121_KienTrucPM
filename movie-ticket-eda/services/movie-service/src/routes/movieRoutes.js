// src/routes/movieRoutes.js
const express = require("express");
const router = express.Router();
const c = require("../controllers/movieController");

router.get("/movies", c.getAllMovies);
router.get("/movies/:id", c.getMovieById);
router.post("/movies", c.createMovie);
router.put("/movies/:id", c.updateMovie);
router.delete("/movies/:id", c.deleteMovie);
router.patch("/movies/:id/seats", c.updateSeats);

module.exports = router;

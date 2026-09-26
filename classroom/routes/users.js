const express = require("express");
const router = express.Router();


//Index-users
router.get("/",(req, res) =>{
    res.send("GET for users");
});
//Show-users
router.get("/:id",(req, res) =>{
    res.send("GET for show user id");
});
//Post-users
router.post("/",(req, res) =>{
    res.send("POST for show users");
});
//DELETE-users
router.delete("/:id",(req, res) =>{
    res.send("DELETE for show user id");
});

module.exports = router;
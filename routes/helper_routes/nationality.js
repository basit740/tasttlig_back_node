"use strict";

const router = require('express').Router();
const nationality_service = require("../../services/helper_functions/nationality");

router.get("/", async (req, res) => {
    try {
        const response = await nationality_service.getAll();
        return res.send(response);
    } catch (err) {
        res.send({
            success: false,
            message: "error",
            response: err
        });
    }
})

module.exports = router;
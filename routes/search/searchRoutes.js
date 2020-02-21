"use strict";

const searchRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Search = require("../../db/queries/search/search");
const { authenticateToken } = auth;

searchRouter.post("/api/search", async (req, res) => {
  const keyword = req.body.keyword;
  const currentPage = req.body.currentPage;
  const response = await Search.searchKeyword(keyword, currentPage);
  res.json(response);
});

searchRouter.post("/api/indexsearch", async (req, res) => {
  const keyword = req.body.keyword;
  const currentPage = req.body.currentPage;
  const response = await Search.indexSearch(keyword, currentPage);
  res.json(response);
});

module.exports = searchRouter;

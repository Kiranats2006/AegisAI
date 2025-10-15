const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../Controllers/contacts.controller");

const postContactRoute = router.post("/", addContact);
const getContactsRoute = router.get("/", getContacts);
const putContactRoute = router.put("/:id", updateContact);
const deleteContactRoute = router.delete("/:id", deleteContact);

module.exports = router;

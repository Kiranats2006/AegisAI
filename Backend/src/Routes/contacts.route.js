const express = require("express");
const router = express.Router();
const {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../Controllers/contacts.controller");

router.post("/", addContact);
router.get("/", getContacts);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

module.exports = router;

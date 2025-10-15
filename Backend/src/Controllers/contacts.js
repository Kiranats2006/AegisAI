const Contact = require('../models/Contact');

// Add emergency contact
const addContact = async (req, res) => {
  try {
    const { name, phone, email, relationship, priority, notes } = req.body;

    if (!name || !phone || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and relationship are required'
      });
    }

    const existingContact = await Contact.findOne({
      userId: req.user.id,
      phone: phone
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message: 'Contact with this phone number already exists'
      });
    }

    const contact = new Contact({
      userId: req.user.id,
      name,
      phone,
      email,
      relationship,
      priority: priority || 3,
      notes
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: contact
    });

  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding contact'
    });
  }
};

// Get all contacts for user
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ priority: 1, name: 1 });

    res.json({
      success: true,
      data: contacts,
      count: contacts.length
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
};

// Update contact
const updateContact = async (req, res) => {
  try {
    const { name, phone, email, relationship, priority, notes, isActive } = req.body;
    
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (relationship) contact.relationship = relationship;
    if (priority) contact.priority = priority;
    if (notes !== undefined) contact.notes = notes;
    if (isActive !== undefined) contact.isActive = isActive;

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact'
    });
  }
};

// Soft delete contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.isActive = false;
    await contact.save();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact'
    });
  }
};

module.exports = {
  addContact,
  getContacts,
  updateContact,
  deleteContact
};

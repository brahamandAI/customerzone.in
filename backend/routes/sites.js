const express = require('express');
const router = express.Router();
const Site = require('../models/Site');

// Create new site with budget configuration
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      contactPerson,
      phone,
      email,
      budget,
      vehicleKmLimit,
      categoryBudgets,
      createdBy
    } = req.body;

    // Validate required fields
    if (
      !name || !code ||
      !location || !location.address || !location.city || !location.state || !location.pincode ||
      !budget || !budget.monthly || !budget.yearly ||
      !createdBy
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if site already exists
    const existingSite = await Site.findOne({ code });
    if (existingSite) {
      return res.status(400).json({
        success: false,
        message: 'Site with this code already exists'
      });
    }

    // Create new site
    const newSite = new Site({
      name,
      code,
      location,
      contactPerson,
      phone,
      email,
      budget,
      vehicleKmLimit,
      categoryBudgets,
      createdBy
    });

    await newSite.save();

    res.status(201).json({
      success: true,
      message: 'Site created successfully with budget configuration',
      data: newSite
    });

  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all sites with budget information
router.get('/all', async (req, res) => {
  try {
    const sites = await Site.find({ isActive: true })
      .select('name code isActive createdAt');

    res.json({
      success: true,
      data: sites
    });

  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get site budget alerts
router.get('/budget-alerts', async (req, res) => {
  try {
    const sites = await Site.find({ isActive: true });
    
    const alerts = sites
      .filter(site => site.shouldAlert)
      .map(site => ({
        siteId: site._id,
        clientId: site.clientId,
        clientName: site.clientName,
        utilizationPercentage: site.utilizationPercentage,
        budgetAlertThreshold: site.budgetAlertThreshold,
        remainingBudget: site.remainingBudget,
        totalBudget: site.totalBudget,
        categoryBudgets: site.categoryBudgets
      }));

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update site budget
router.put('/:siteId/budget', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { monthlyBudget, budgetAlertThreshold, categoryBudgets, vehicleKmLimit } = req.body;

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    // Update budget fields
    if (monthlyBudget !== undefined) site.monthlyBudget = monthlyBudget;
    if (budgetAlertThreshold !== undefined) site.budgetAlertThreshold = budgetAlertThreshold;
    if (categoryBudgets !== undefined) site.categoryBudgets = categoryBudgets;
    if (vehicleKmLimit !== undefined) site.vehicleKmLimit = vehicleKmLimit;

    await site.save();

    res.json({
      success: true,
      message: 'Site budget updated successfully',
      data: site
    });

  } catch (error) {
    console.error('Error updating site budget:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get site by ID
router.get('/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    res.json({
      success: true,
      data: site
    });

  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 
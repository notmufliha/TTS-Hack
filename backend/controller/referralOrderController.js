const ReferralOrder = require("../models/ReferralOrder");

const referralOrderController = {
  getAllReferralOrders: async (req, res) => {
    try {
      const referralOrders = await ReferralOrder.findAll();
      res.json({
        success: true,
        count: referralOrders.length,
        referralOrders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching referral orders",
        error: error.message,
      });
    }
  },

  getReferralOrderById: async (req, res) => {
    try {
      const referralOrder = await ReferralOrder.findById(req.params.id);
      if (!referralOrder) {
        return res.status(404).json({
          success: false,
          message: "Referral order not found",
        });
      }
      res.json({
        success: true,
        referralOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching referral order",
        error: error.message,
      });
    }
  },

  createReferralOrder: async (req, res) => {
    try {
      const referralOrderData = req.body;

      if (!referralOrderData.patient_id || !referralOrderData.order_datetime) {
        return res.status(400).json({
          success: false,
          message: "Patient ID and order datetime are required",
        });
      }

      const referralOrder = await ReferralOrder.create(referralOrderData);
      res.status(201).json({
        success: true,
        message: "Referral order created successfully",
        referralOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating referral order",
        error: error.message,
      });
    }
  },

  updateReferralOrder: async (req, res) => {
    try {
      const referralOrder = await ReferralOrder.update(req.params.id, req.body);
      if (!referralOrder) {
        return res.status(404).json({
          success: false,
          message: "Referral order not found",
        });
      }
      res.json({
        success: true,
        message: "Referral order updated successfully",
        referralOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating referral order",
        error: error.message,
      });
    }
  },

  deleteReferralOrder: async (req, res) => {
    try {
      const referralOrder = await ReferralOrder.delete(req.params.id);
      if (!referralOrder) {
        return res.status(404).json({
          success: false,
          message: "Referral order not found",
        });
      }
      res.json({
        success: true,
        message: "Referral order deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting referral order",
        error: error.message,
      });
    }
  },

  getReferralOrdersByPatient: async (req, res) => {
    try {
      const referralOrders = await ReferralOrder.findByPatientId(
        req.params.patientId
      );
      res.json({
        success: true,
        count: referralOrders.length,
        referralOrders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching patient referral orders",
        error: error.message,
      });
    }
  },

  getReferralOrdersByStatus: async (req, res) => {
    try {
      const referralOrders = await ReferralOrder.findByStatus(
        req.params.status
      );
      res.json({
        success: true,
        count: referralOrders.length,
        referralOrders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching referral orders by status",
        error: error.message,
      });
    }
  },
  startProcess: async (req, res) => {
    try {
      const { order_id, psa_name = "muf" } = req.body;

      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const result = await ReferralOrder.startProcess(order_id, psa_name);

      res.json({
        success: true,
        message: "Process started successfully",
        data: result,
      });
    } catch (error) {
      console.error("Start process error:", error);

      if (error.message === "Order not found or already processed") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error starting process",
        error: error.message,
      });
    }
  },
};

module.exports = referralOrderController;

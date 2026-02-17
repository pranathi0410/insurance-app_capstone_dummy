const Policy = require("../models/Policy");
const User = require("../models/User");
const { logAction } = require("../services/auditService");

// Create policy (DRAFT)
exports.createPolicy = async (req, res) => {
  const {
    insuredName,
    insuredType,
    lineOfBusiness,
    sumInsured,
    premium,
    retentionLimit,
    effectiveFrom,
    effectiveTo,
  } = req.body;
  const policyNumber = "POL" + Date.now(); // Simple auto-gen
  const policy = new Policy({
    policyNumber,
    insuredName,
    insuredType,
    lineOfBusiness,
    sumInsured,
    premium,
    retentionLimit,
    status: "DRAFT",
    effectiveFrom,
    effectiveTo,
    createdBy: req.user._id,
  });
  await policy.save();
  await logAction({
    entityType: "POLICY",
    entityId: policy._id,
    action: "CREATE",
    newValue: policy,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });
  res.status(201).json(policy);
};

// Get all policies (filtered for Underwriter)
const mongoose = require("mongoose");
exports.getPolicies = async (req, res) => {
  let query = {};
  if (req.user.role === "UNDERWRITER") {
    let userId = req.user._id;
    // Only cast if not already an ObjectId
    if (typeof userId === "string") {
      userId = mongoose.Types.ObjectId(userId);
    }
    query = { createdBy: userId };
  }
  const policies = await Policy.find(query).populate("createdBy approvedBy");
  res.json(policies);
};

// Get policy by ID
exports.getPolicyById = async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate(
    "createdBy approvedBy",
  );
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  res.json(policy);
};

// Submit policy for approval (DRAFT -> SUBMITTED)
exports.submitPolicy = async (req, res) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  if (policy.status !== "DRAFT") {
    return res
      .status(400)
      .json({ message: "Only DRAFT policies can be submitted." });
  }
  const oldValue = { ...policy.toObject() };
  policy.status = "SUBMITTED";
  await policy.save();
  await logAction({
    entityType: "POLICY",
    entityId: policy._id,
    action: "UPDATE",
    oldValue,
    newValue: policy,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });
  res.json(policy);
};

// Approve policy (Underwriter) - SUBMITTED -> ACTIVE, triggers risk allocation
const Treaty = require("../models/Treaty");
const RiskAllocation = require("../models/RiskAllocation");

exports.approvePolicy = async (req, res) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  if (policy.status !== "SUBMITTED") {
    return res
      .status(400)
      .json({ message: "Only SUBMITTED policies can be approved." });
  }
  const oldValue = { ...policy.toObject() };

  policy.status = "ACTIVE";
  policy.approvedBy = req.user._id;
  await policy.save();

  // Automatic reinsurance allocation
  if (policy.sumInsured > policy.retentionLimit) {
    // Find applicable treaties (active, matching LOB, and whose retentionLimit is applicable)
    const treaties = await Treaty.find({
      retentionLimit: { $lte: policy.sumInsured },
      applicableLOBs: policy.lineOfBusiness,
      status: "ACTIVE",
    }).sort({ sharePercentage: -1 }); // prefer larger shares first

    // Allocate from the ceded (excess) amount: ceded = sumInsured - retentionLimit
    const cededAmount = Math.max(0, policy.sumInsured - policy.retentionLimit);
    let remainingCeded = cededAmount;
    const allocations = [];

    for (const t of treaties) {
      if (remainingCeded <= 0) break;
      const sharePct = Number(t.sharePercentage || 0);
      // desired allocation based on share of the ceded amount
      let desired = (cededAmount * sharePct) / 100;

      // enforce treatyLimit if present (treatyLimit is an absolute cap)
      if (typeof t.treatyLimit === "number" && isFinite(t.treatyLimit)) {
        desired = Math.min(desired, t.treatyLimit);
      }

      // do not allocate more than remaining ceded amount
      const allocated = Math.min(desired, remainingCeded);
      if (allocated <= 0) continue;

      // store allocatedPercentage relative to total sumInsured for UI consistency
      const allocatedPctOfSum = Number(
        ((allocated / policy.sumInsured) * 100).toFixed(2),
      );

      allocations.push({
        reinsurerId: t.reinsurerId,
        treatyId: t._id,
        allocatedAmount: allocated,
        allocatedPercentage: allocatedPctOfSum,
      });

      remainingCeded -= allocated;
    }

    const totalAllocated = allocations.reduce(
      (s, a) => s + (a.allocatedAmount || 0),
      0,
    );
    const retainedAmount = policy.sumInsured - totalAllocated;

    await RiskAllocation.create({
      policyId: policy._id,
      allocations,
      retainedAmount,
      calculatedBy: req.user._id,
    });
  }

  await logAction({
    entityType: "POLICY",
    entityId: policy._id,
    action: "APPROVE",
    oldValue,
    newValue: policy,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  res.json(policy);
};

// Update policy
exports.updatePolicy = async (req, res) => {
  const oldValue = await Policy.findById(req.params.id);
  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  await logAction({
    entityType: "POLICY",
    entityId: policy._id,
    action: "UPDATE",
    oldValue,
    newValue: policy,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });
  res.json(policy);
};

// Delete policy
exports.deletePolicy = async (req, res) => {
  const policy = await Policy.findByIdAndDelete(req.params.id);
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  await logAction({
    entityType: "POLICY",
    entityId: policy._id,
    action: "DELETE",
    oldValue: policy,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });
  res.json({ message: "Policy deleted" });
};

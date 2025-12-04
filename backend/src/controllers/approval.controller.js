import ApprovalFlow from '../models/ApprovalFlow.js';
import ApprovalRequest from '../models/ApprovalRequest.js';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server.js';

export const createApprovalFlow = async (req, res) => {
  try {
    const flowData = req.body;
    const flow = await ApprovalFlow.create(flowData);
    
    res.status(201).json({
      success: true,
      data: flow
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApprovalFlows = async (req, res) => {
  try {
    const { module, isActive } = req.query;
    
    const query = {};
    if (module) query.module = module;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const flows = await ApprovalFlow.find(query)
      .populate('steps.approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: flows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createApprovalRequest = async (req, res) => {
  try {
    const { module, referenceId, approvalFlowId, priority, dueDate } = req.body;

    // Generate unique request ID
    const requestId = `REQ${Date.now()}`;

    const approvalRequest = await ApprovalRequest.create({
      requestId,
      module,
      referenceId,
      requester: req.user.id,
      approvalFlow: approvalFlowId,
      priority: priority || 'medium',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      currentStep: 1
    });

    // Populate for notification
    await approvalRequest.populate('requester', 'personalInfo.firstName personalInfo.lastName employeeId');
    await approvalRequest.populate('approvalFlow');

    // Send notification to first approver
    const firstStep = approvalRequest.approvalFlow.steps[0];
    if (firstStep) {
      const approverId = firstStep.approver || req.user.manager; // Fallback to user's manager
      if (approverId) {
        io.to(approverId.toString()).emit('new-approval-request', {
          requestId: approvalRequest.requestId,
          module: approvalRequest.module,
          requesterName: `${approvalRequest.requester.personalInfo.firstName} ${approvalRequest.requester.personalInfo.lastName}`,
          priority: approvalRequest.priority
        });
      }
    }

    res.status(201).json({
      success: true,
      data: approvalRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApprovalRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, module, type } = req.query;
    
    const query = {};
    
    if (type === 'pending') {
      // Get requests where current user is the approver
      query.$or = [
        { 'approvals.approver': req.user.id, 'approvals.status': 'pending' },
        { 'approvalFlow.steps.approver': req.user.id }
      ];
    } else if (type === 'sent') {
      // Get requests sent by current user
      query.requester = req.user.id;
    } else {
      // Get all requests for admins/HR
      if (req.user.role === 'employee') {
        query.requester = req.user.id;
      }
    }

    if (status) query.status = status;
    if (module) query.module = module;

    const requests = await ApprovalRequest.find(query)
      .populate('requester', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('approvalFlow')
      .populate('approvals.approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ApprovalRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const request = await ApprovalRequest.findById(req.params.id)
      .populate('approvalFlow')
      .populate('requester', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    // Check if user can approve this step
    const currentStep = request.approvalFlow.steps[request.currentStep - 1];
    if (!currentStep) {
      return res.status(400).json({ message: 'Invalid approval step' });
    }

    // Update approval record
    const approvalRecord = request.approvals.find(
      a => a.step === request.currentStep && a.approver.toString() === req.user.id
    );

    if (!approvalRecord) {
      // Create new approval record
      request.approvals.push({
        step: request.currentStep,
        approver: req.user.id,
        status: status,
        comment: comment,
        [status === 'approved' ? 'approvedAt' : 'rejectedAt']: new Date()
      });
    } else {
      // Update existing record
      approvalRecord.status = status;
      approvalRecord.comment = comment;
      approvalRecord[status === 'approved' ? 'approvedAt' : 'rejectedAt'] = new Date();
    }

    // Check if step is complete
    const stepApprovals = request.approvals.filter(a => a.step === request.currentStep);
    const approvedCount = stepApprovals.filter(a => a.status === 'approved').length;

    if (status === 'rejected' || approvedCount >= currentStep.requiredApprovals) {
      // Move to next step or complete request
      if (status === 'rejected') {
        request.status = 'rejected';
      } else if (request.currentStep < request.approvalFlow.steps.length) {
        // Move to next step
        request.currentStep += 1;
        
        // Notify next approver
        const nextStep = request.approvalFlow.steps[request.currentStep - 1];
        if (nextStep && nextStep.approver) {
          io.to(nextStep.approver.toString()).emit('new-approval-request', {
            requestId: request.requestId,
            module: request.module,
            requesterName: `${request.requester.personalInfo.firstName} ${request.requester.personalInfo.lastName}`,
            priority: request.priority
          });
        }
      } else {
        // All steps completed
        request.status = 'approved';
      }
    }

    // Add to history
    request.history.push({
      action: status === 'approved' ? 'approved' : 'rejected',
      performedBy: req.user.id,
      performedAt: new Date(),
      note: comment
    });

    await request.save();

    // Notify requester
    io.to(request.requester._id.toString()).emit('approval-status-update', {
      requestId: request.requestId,
      status: request.status,
      step: request.currentStep,
      approverComment: comment
    });

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    // Check if user is the requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only requester can cancel the request' });
    }

    // Check if request can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel request that is not pending' });
    }

    request.status = 'cancelled';
    request.history.push({
      action: 'cancelled',
      performedBy: req.user.id,
      performedAt: new Date()
    });

    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
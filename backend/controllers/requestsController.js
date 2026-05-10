import Request from "../models/Request.js";

// @desc  Student creates a new request
// @route POST /api/requests
// @access Private/Student
export const createRequest = async (req, res) => {
  try {
    const { type, subject, semester, description } = req.body;
    if (!type || !subject || !description) {
      return res.status(400).json({ message: "type, subject and description are required." });
    }
    const request = await Request.create({
      student: req.user._id,
      studentName: req.user.name,
      type, subject, semester, description
    });
    res.status(201).json({ message: "Request submitted successfully.", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Student gets their own requests
// @route GET /api/requests/mine
// @access Private/Student
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Teacher/Admin gets all requests
// @route GET /api/requests
// @access Private/Teacher, Admin
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Teacher responds to a request
// @route PUT /api/requests/:id/respond
// @access Private/Teacher, Admin
export const respondToRequest = async (req, res) => {
  try {
    const { status, teacherResponse } = req.body;
    const allowed = ["under_review", "resolved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        status,
        teacherResponse: teacherResponse || "",
        respondedBy: req.user._id,
        respondedAt: new Date()
      },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json({ message: "Response saved.", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Delete a request (student can delete own pending requests)
// @route DELETE /api/requests/:id
// @access Private
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be deleted." });
    }
    await request.deleteOne();
    res.json({ message: "Request deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

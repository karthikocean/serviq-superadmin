import api from "./api";

/**
 * 1. Fetch tickets list with filters and pagination
 * Endpoint: GET /api/super-admin/tickets
 */
export const getTickets = async (params = {}) => {
  const cleanParams = {};

  cleanParams.page = params.page !== undefined ? Number(params.page) : 0;
  if (params.limit !== undefined) {
    cleanParams.limit = Number(params.limit);
  }

  // Search query (support both search and searchTerm expected by backend)
  const searchVal = params.searchTerm || params.search || params.query || "";
  if (searchVal) {
    cleanParams.search = searchVal;
    cleanParams.searchTerm = searchVal;
  }

  // Filter options (support both status and statusFilter keys)
  const statusVal = params.statusFilter || params.status;
  if (statusVal && statusVal !== "All" && statusVal !== "All Statuses") {
    cleanParams.status = statusVal;
    cleanParams.statusFilter = statusVal;
  }

  const priorityVal = params.priorityFilter || params.priority;
  if (priorityVal && priorityVal !== "All" && priorityVal !== "All Priorities") {
    cleanParams.priority = priorityVal;
    cleanParams.priorityFilter = priorityVal;
  }

  const categoryVal = params.categoryFilter || params.category;
  if (categoryVal && categoryVal !== "All" && categoryVal !== "All Categories") {
    cleanParams.category = categoryVal;
    cleanParams.categoryFilter = categoryVal;
  }

  const response = await api.get("/tickets", { params: cleanParams });
  return response.data;
};

/**
 * 2. Fetch single ticket details by ID
 * Endpoint: GET /api/super-admin/tickets/:id
 */
export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

/**
 * 3. Assign ticket to support agent
 * Endpoint: PATCH/PUT/POST /api/super-admin/tickets/:id/assign
 */
export const assignTicket = async (id, assignedUser, extraData = {}) => {
  const payload =
    typeof assignedUser === "object" && assignedUser !== null
      ? { ...assignedUser, ...extraData }
      : {
          assignedUser: assignedUser || "Unassigned",
          assignedTo: assignedUser || "Unassigned",
          agentName: assignedUser || "Unassigned",
          ...extraData
        };

  const methods = ["patch", "put", "post"];
  let lastErr = null;

  for (const method of methods) {
    try {
      const response = await api[method](`/tickets/${id}/assign`, payload);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      lastErr = err;
    }
  }

  if (lastErr) throw lastErr;
};

/**
 * 4. Create new ticket
 * Endpoint: POST /api/super-admin/tickets
 */
export const createTicket = async (data) => {
  const response = await api.post("/tickets", data);
  return response.data;
};

/**
 * 5. Update ticket status (e.g. In Progress, Resolved)
 * Endpoint: PATCH/PUT/POST /api/super-admin/tickets/:id/status
 */
export const updateTicketStatus = async (id, status, extraData = {}) => {
  const payload = typeof status === "object" ? status : { status, ...extraData };
  const methods = ["patch", "put", "post"];
  const paths = [
    `/tickets/${id}/status`,
    `/tickets/${id}`,
    `/tickets/${id}/resolve`
  ];

  let lastErr = null;
  for (const path of paths) {
    for (const method of methods) {
      try {
        const response = await api[method](path, payload);
        if (response && response.data) {
          return response.data;
        }
      } catch (err) {
        lastErr = err;
      }
    }
  }
  if (lastErr) throw lastErr;
};

/**
 * 6. Send reply / resolution note to ticket
 * Endpoint: POST/PATCH/PUT /api/super-admin/tickets/:id/reply
 */
export const replyToTicket = async (id, replyData) => {
  let text = "";
  if (typeof replyData === "string") {
    text = replyData;
  } else if (typeof replyData === "object" && replyData !== null) {
    text =
      replyData.message ||
      replyData.reply ||
      replyData.response ||
      replyData.text ||
      replyData.resolution ||
      replyData.resolutionMessage ||
      "";
  }

  const senderName =
    (typeof replyData === "object" &&
      (replyData?.sender || replyData?.senderName)) ||
    "Super Admin";

  const payload = {
    reply: text,
    message: text,
    response: text,
    text: text,
    comment: text,
    resolution: text,
    resolutionMessage: text,
    resolutionNote: text,
    sender: senderName,
    senderName: senderName,
    senderRole: "super_admin",
    role: "super_admin",
    author: senderName,
    createdBy: senderName,
    createdAt: new Date().toISOString(),
    ...(typeof replyData === "object" ? replyData : {})
  };

  const methods = ["post", "patch", "put"];
  const paths = [
    `/tickets/${id}/reply`,
    `/tickets/${id}/response`,
    `/tickets/${id}/responses`,
    `/tickets/${id}/messages`,
    `/tickets/${id}/comments`,
    `/tickets/${id}`
  ];

  let lastError = null;
  for (const path of paths) {
    for (const method of methods) {
      try {
        const response = await api[method](path, payload);
        if (response && response.data) {
          return response.data;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  if (lastError) throw lastError;
};

/**
 * 7. General update ticket
 */
export const updateTicket = async (id, data) => {
  const methods = ["patch", "put", "post"];
  const paths = [`/tickets/${id}`, `/tickets/${id}/update`];
  for (const path of paths) {
    for (const method of methods) {
      try {
        const response = await api[method](path, data);
        if (response && response.data) return response.data;
      } catch (err) {
        // try next
      }
    }
  }
};

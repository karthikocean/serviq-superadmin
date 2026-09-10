import api from "./api";

export const getTickets = async (params) => {
  const response = await api.get("/tickets", { params });
  return response.data;
};

export const createTicket = async (data) => {
  const response = await api.post("/tickets", data);
  return response.data;
};

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

export const assignTicket = async (id, assignedUser) => {
  const response = await api.patch(`/tickets/${id}/assign`, { assignedUser });
  return response.data;
};

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




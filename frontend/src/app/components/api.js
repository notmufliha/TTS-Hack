const API_BASE_URL = "http://127.0.0.1:8000/api";

// Generic fetch function with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// Patients API
export const patientsAPI = {
  getAll: () => fetchAPI("/patients"),
  getById: (id) => fetchAPI(`/patients/${id}`),
  create: (patientData) =>
    fetchAPI("/patients", {
      method: "POST",
      body: JSON.stringify(patientData),
    }),
  update: (id, patientData) =>
    fetchAPI(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(patientData),
    }),
  delete: (id) => fetchAPI(`/patients/${id}`, { method: "DELETE" }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => fetchAPI("/appointments"),
  getById: (id) => fetchAPI(`/appointments/${id}`),
  create: (appointmentData) =>
    fetchAPI("/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    }),
  update: (id, appointmentData) =>
    fetchAPI(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(appointmentData),
    }),
  delete: (id) => fetchAPI(`/appointments/${id}`, { method: "DELETE" }),
  getByPatientId: (patientId) => fetchAPI(`/appointments/patient/${patientId}`),
};

// Medical History API
export const medicalHistoryAPI = {
  getAll: () => fetchAPI("/medical-history"),
  getByPatientId: (patientId) =>
    fetchAPI(`/medical-history/patient/${patientId}`),
  create: (medicalData) =>
    fetchAPI("/medical-history", {
      method: "POST",
      body: JSON.stringify(medicalData),
    }),
  update: (id, medicalData) =>
    fetchAPI(`/medical-history/${id}`, {
      method: "PUT",
      body: JSON.stringify(medicalData),
    }),
};

// Swabs API
export const swabsAPI = {
  getAll: () => fetchAPI("/swabs"),
  getById: (id) => fetchAPI(`/swabs/${id}`),
  create: (swabData) =>
    fetchAPI("/swabs", {
      method: "POST",
      body: JSON.stringify(swabData),
    }),
  update: (id, swabData) =>
    fetchAPI(`/swabs/${id}`, {
      method: "PUT",
      body: JSON.stringify(swabData),
    }),
  delete: (id) => fetchAPI(`/swabs/${id}`, { method: "DELETE" }),
  getByPatientId: (patientId) => fetchAPI(`/swabs/patient/${patientId}`),
};
// Referral Orders API
export const referralOrdersAPI = {
  getAll: () => fetchAPI("/referral-orders"),
  getById: (id) => fetchAPI(`/referral-orders/${id}`),
  create: (referralOrderData) =>
    fetchAPI("/referral-orders", {
      method: "POST",
      body: JSON.stringify(referralOrderData),
    }),
  update: (id, referralOrderData) =>
    fetchAPI(`/referral-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(referralOrderData),
    }),
  delete: (id) => fetchAPI(`/referral-orders/${id}`, { method: "DELETE" }),
  getByPatientId: (patientId) =>
    fetchAPI(`/referral-orders/patient/${patientId}`),
  getByStatus: (status) => fetchAPI(`/referral-orders/status/${status}`),
};

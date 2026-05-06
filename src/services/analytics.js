import api from "./salesApi";

// OVERVIEW
export const getOverview = async () => {
  return (await api.get("/analytics/overview")).data.data;
};

// EXECUTIVE Page

// KPI cards
export const getExecutiveKPIs = async (params) => {
  return (await api.get("/analytics/executive-kpis", {
    params: cleanParams(params),
  })).data.data;
};

// Revenue chart (drill down)
export const getRevenueTrending = async (params) => {
  return (await api.get("/analytics/revenue-trending", {
    params: cleanParams(params),
  })).data.data;
};

// Category bar
export const getSalesByCategory = async (params) => {
  return (await api.get("/analytics/sales-by-category", {
    params: cleanParams(params),
  })).data.data;
};

// Country table
export const getCountryStats = async (params) => {
  return (await api.get("/analytics/country-stats", {
    params: cleanParams(params),
  })).data.data;
};

// DETAIL TABLE
export const getSalesDetail = async (params) => {
  return (await api.get("/analytics/sales-detail", {
    params: cleanParams(params),
  })).data.data;
};

// PRODUCTS 
export const getTopProducts = async () => {
  return (await api.get("/analytics/top-products", {
    params: { limit: 10 },
  })).data.data;
};

// HELPER: remove null/undefined 
const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== "") {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

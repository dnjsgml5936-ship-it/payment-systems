import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { SettlementRequest, User, Notification } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      // 로그인 화면으로 리다이렉트
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// 대시보드 API
export const fetchDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data.data;
};

// 정산결의서 API
export const fetchSettlements = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await api.get('/settlements', { params });
  return response.data.data;
};

export const fetchSettlementDetail = async (id: string) => {
  const response = await api.get(`/settlements/${id}`);
  return response.data.data;
};

// 결재 API
export const fetchApprovals = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await api.get('/approvals', { params });
  return response.data.data;
};

export const fetchApprovalDetail = async (id: string) => {
  const response = await api.get(`/approvals/${id}`);
  return response.data.data;
};

export const submitApproval = async (id: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
  const response = await api.post(`/approvals/${id}`, { status, comment });
  return response.data;
};

export const approveSettlement = async (id: string, data: { action: 'approve' | 'reject'; comment?: string }) => {
  const response = await api.post(`/approvals/${id}/approve`, data);
  return response.data;
};

// 알림 API
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// 파일 업로드 API
export const uploadFile = async (file: any) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;

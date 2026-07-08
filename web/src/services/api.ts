/**
 * API 客户端
 *
 * 处理与 Express 服务器的 HTTP 通信
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 180000, // 3分钟超时（视频生成可能需要较长时间）
});

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  needsConfirmation: boolean;
  clarifications: string[];
}

export interface UploadResponse {
  path: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface Project {
  sessionId: string;
  projectPath: string;
  metadata: any;
}

/**
 * 发送聊天消息
 */
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>('/chat', data);
  return response.data;
}

/**
 * 上传文件
 */
export async function uploadFile(file: File, sessionId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) {
    formData.append('sessionId', sessionId);
  }

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * 上传多个文件
 */
export async function uploadFiles(files: File[]): Promise<{ files: UploadResponse[] }> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post<{ files: UploadResponse[] }>('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * 获取项目列表
 */
export async function getProjects(): Promise<{ projects: Project[] }> {
  const response = await api.get<{ projects: Project[] }>('/projects');
  return response.data;
}

/**
 * 获取项目详情
 */
export async function getProject(sessionId: string): Promise<Project> {
  const response = await api.get<Project>(`/projects/${sessionId}`);
  return response.data;
}

/**
 * 获取制品
 */
export async function getArtifact(sessionId: string, type: string): Promise<string> {
  const response = await api.get<string>(`/projects/${sessionId}/artifacts/${type}`);
  return response.data;
}

export default api;

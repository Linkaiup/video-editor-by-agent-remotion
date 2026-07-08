/**
 * App 主组件
 */

import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { AssetUpload } from './components/AssetUpload';
import type { UploadResponse } from './services/api';

function App() {
  const [sessionId, setSessionId] = useState<string>();
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);

  const handleSessionCreated = (id: string) => {
    setSessionId(id);
  };

  const handleUploadComplete = (files: UploadResponse[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Remotion Agent - 视频编辑器
            </h1>
            {sessionId && (
              <span className="text-sm text-gray-500">
                会话: {sessionId.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Asset Upload */}
          <div className="lg:col-span-1">
            <AssetUpload
              sessionId={sessionId}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Right: Chat Interface */}
          <div className="lg:col-span-2 h-[calc(100vh-12rem)]">
            <ChatInterface
              sessionId={sessionId}
              uploadedFiles={uploadedFiles}
              onSessionCreated={handleSessionCreated}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">已上传素材</p>
                <p className="text-2xl font-semibold text-gray-900">{uploadedFiles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Harness 状态</p>
                <p className="text-2xl font-semibold text-gray-900">就绪</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">生成的视频</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Powered by Remotion Agent • Harness 7-Step Pipeline
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

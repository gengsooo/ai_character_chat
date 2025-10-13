'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { PDFAnalysisResult } from '@/types/character';

interface PDFUploaderProps {
  onUploadSuccess: (result: PDFAnalysisResult) => void;
  onUploadError: (error: string) => void;
}

/**
 * PDF 파일 업로드 컴포넌트
 * 드래그앤드롭 및 파일 선택 기능 제공
 */
const PDFUploader = ({ onUploadSuccess, onUploadError }: PDFUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * 파일 업로드 처리 함수
   */
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // 파일 타입 검증
    if (file.type !== 'application/pdf') {
      const error = 'PDF 파일만 업로드 가능합니다.';
      setUploadStatus('error');
      setStatusMessage(error);
      onUploadError(error);
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      const error = '파일 크기는 10MB 이하여야 합니다.';
      setUploadStatus('error');
      setStatusMessage(error);
      onUploadError(error);
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setStatusMessage('PDF 파일을 분석하고 있습니다...');

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('pdf', file);

      // API 호출
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const result: PDFAnalysisResult = await response.json();

      if (result.success && result.characterInfo) {
        setUploadStatus('success');
        setStatusMessage(`인물 정보가 성공적으로 추출되었습니다: ${result.characterInfo.name}`);
        onUploadSuccess(result);
      } else {
        throw new Error(result.error || '인물 정보 추출에 실패했습니다.');
      }

    } catch (error) {
      console.error('업로드 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.';
      setUploadStatus('error');
      setStatusMessage(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, onUploadError]);

  // react-dropzone 설정
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isUploading,
  });

  /**
   * 상태에 따른 아이콘 렌더링
   */
  const renderStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Upload className="w-8 h-8 text-primary-500" />;
    }
  };

  /**
   * 상태에 따른 스타일 클래스
   */
  const getDropzoneClasses = () => {
    const baseClasses = "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer";
    
    if (isUploading) {
      return `${baseClasses} border-primary-300 bg-primary-50 cursor-not-allowed`;
    }
    
    if (isDragActive) {
      return `${baseClasses} border-primary-500 bg-primary-50 transform scale-105`;
    }
    
    if (uploadStatus === 'success') {
      return `${baseClasses} border-green-300 bg-green-50`;
    }
    
    if (uploadStatus === 'error') {
      return `${baseClasses} border-red-300 bg-red-50`;
    }
    
    return `${baseClasses} border-gray-300 hover:border-primary-400 hover:bg-primary-50`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 드롭존 */}
      <div {...getRootProps()} className={getDropzoneClasses()}>
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {renderStatusIcon()}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              {isDragActive ? 'PDF 파일을 여기에 놓으세요' : 'PDF 파일 업로드'}
            </h3>
            
            {!isUploading && (
              <p className="text-sm text-gray-500">
                {isDragActive 
                  ? '파일을 놓으면 업로드가 시작됩니다'
                  : '클릭하거나 파일을 드래그해서 업로드하세요'
                }
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 상태 메시지 */}
      {statusMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          uploadStatus === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200'
            : uploadStatus === 'error'
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-blue-100 text-blue-700 border border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* 업로드 가이드 */}
      {uploadStatus === 'idle' && (
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <p>• 지원 형식: PDF</p>
          <p>• 최대 크기: 10MB</p>
          <p>• 인물의 외모, 성격, 직업 등이 포함된 문서를 업로드하세요</p>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;

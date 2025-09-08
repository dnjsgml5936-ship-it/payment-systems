'use client'

import { useState } from 'react'
import { FileText, Image, Download, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'

interface FileViewerProps {
  url: string
  fileName?: string
  type?: 'image' | 'pdf' | 'other'
  className?: string
}

export default function FileViewer({ url, fileName, type, className }: FileViewerProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getFileType = (url: string, fileName?: string) => {
    if (type) return type
    
    const ext = fileName?.split('.').pop()?.toLowerCase() || url.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return 'image'
    } else if (ext === 'pdf') {
      return 'pdf'
    }
    return 'other'
  }

  const fileType = getFileType(url, fileName)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'download'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          {getFileIcon()}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {fileName || '첨부파일'}
            </p>
            <p className="text-xs text-gray-500">
              {fileType === 'image' ? '이미지 파일' : fileType === 'pdf' ? 'PDF 파일' : '파일'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            보기
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3 mr-1" />
            다운로드
          </Button>
        </div>
      </div>

      {/* 파일 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {fileName || '파일 미리보기'}
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                닫기
              </Button>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              {fileType === 'image' ? (
                <img
                  src={url}
                  alt={fileName || '이미지'}
                  className="max-w-full max-h-full object-contain"
                />
              ) : fileType === 'pdf' ? (
                <iframe
                  src={url}
                  className="w-full h-96 border-0"
                  title={fileName || 'PDF'}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">미리보기를 지원하지 않는 파일 형식입니다.</p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

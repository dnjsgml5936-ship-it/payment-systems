'use client'

import { useState, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Upload, FileText, Image, X, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { validateFileType, validateFileSize, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '@/lib/storage'

interface FileUploadProps {
  name: string
  label?: string
  accept?: string
  maxSize?: number
  onUpload?: (file: File) => Promise<string>
  onRemove?: (url: string) => void
  error?: string
  helperText?: string
}

export default function FileUpload({
  name,
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = MAX_FILE_SIZE_MB,
  onUpload,
  onRemove,
  error,
  helperText,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; size: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setValue, watch } = useFormContext()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!validateFileType(file, SUPPORTED_FILE_TYPES)) {
      alert('지원하지 않는 파일 형식입니다. (PDF, JPG, PNG만 허용)')
      return
    }

    // 파일 크기 검증
    if (!validateFileSize(file, maxSize)) {
      alert(`파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`)
      return
    }

    setUploading(true)
    try {
      if (onUpload) {
        const url = await onUpload(file)
        setUploadedFile({
          name: file.name,
          url,
          size: file.size,
        })
        setValue(name, url)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (uploadedFile && onRemove) {
      onRemove(uploadedFile.url)
    }
    setUploadedFile(null)
    setValue(name, '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {!uploadedFile ? (
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-${name}`}
            />
            <label
              htmlFor={`file-${name}`}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? '업로드 중...' : '파일 선택'}
            </label>
            <span className="text-sm text-gray-500">
              최대 {maxSize}MB
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.name)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500"
              >
                <FileText className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={handleRemove}
                className="text-danger-600 hover:text-danger-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center mt-1 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

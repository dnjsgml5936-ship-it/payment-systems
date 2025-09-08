import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
  size: number
  type: string
}

// 파일 업로드
export async function uploadFile(
  file: File,
  bucket: string = 'settlement-attachments',
  folder?: string
): Promise<UploadResult> {
  try {
    // 파일명 생성
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = folder 
      ? `${folder}/${timestamp}.${fileExt}`
      : `${timestamp}.${fileExt}`

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      throw new Error(`파일 업로드 실패: ${error.message}`)
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      url: publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// 파일 삭제
export async function deleteFile(
  path: string,
  bucket: string = 'settlement-attachments'
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`파일 삭제 실패: ${error.message}`)
    }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

// 파일 다운로드 URL 생성
export function getDownloadUrl(
  path: string,
  bucket: string = 'settlement-attachments',
  expiresIn: number = 3600
): string {
  const { data } = supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  return data?.signedUrl || ''
}

// 파일 정보 조회
export async function getFileInfo(
  path: string,
  bucket: string = 'settlement-attachments'
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    if (error) {
      throw new Error(`파일 정보 조회 실패: ${error.message}`)
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Get file info error:', error)
    throw error
  }
}

// 파일 타입 검증
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// 파일 크기 검증
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

// 이미지 파일인지 확인
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

// PDF 파일인지 확인
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf'
}

// 지원되는 파일 타입
export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
]

// 최대 파일 크기 (10MB)
export const MAX_FILE_SIZE_MB = 10

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 })
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: '지원하지 않는 파일 형식입니다.' }, { status: 400 })
    }

    // 파일명 생성
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${timestamp}.${fileExt}`

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('settlement-attachments')
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ success: false, error: '파일 업로드에 실패했습니다.' }, { status: 500 })
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('settlement-attachments')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: data.path
      }
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

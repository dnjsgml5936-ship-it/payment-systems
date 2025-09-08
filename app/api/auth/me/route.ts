import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // 요청 헤더에서 Authorization 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, error: '인증 토큰이 없습니다.' }, { status: 401 })
    }

    // Supabase 클라이언트 생성 (토큰으로 인증)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('Get user error:', error)
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 사용자 메타데이터에서 정보 가져오기
    const userMetadata = user.user_metadata || {}

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: userMetadata.name || user.email?.split('@')[0] || '사용자',
        role: userMetadata.role || 'USER'
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

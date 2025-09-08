import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(request: NextRequest) {
  try {
    const { language, timezone } = await request.json()

    if (!language || !timezone) {
      return NextResponse.json({ success: false, error: '언어와 시간대를 입력해주세요.' }, { status: 400 })
    }

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
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token)

    if (error || !authUser) {
      console.error('Get user error:', error)
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    // Supabase Admin 클라이언트로 사용자 환경설정 업데이트
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 기존 사용자 메타데이터 가져오기
    const existingMetadata = authUser.user_metadata || {}

    // 사용자 메타데이터 업데이트
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      {
        user_metadata: {
          ...existingMetadata,
          preferences: {
            language,
            timezone
          }
        }
      }
    )

    if (updateError) {
      console.error('Update preferences error:', updateError)
      return NextResponse.json({ success: false, error: '환경설정 업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        preferences: updateData.user.user_metadata?.preferences || { language, timezone }
      },
      message: '환경설정이 성공적으로 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Update preferences API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

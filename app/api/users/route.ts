import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth'

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
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token)

    if (error || !authUser) {
      console.error('Get user error:', error)
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 사용자 메타데이터에서 역할 확인
    const userMetadata = authUser.user_metadata || {}
    const userRole = userMetadata.role || 'USER'

    // 관리자만 접근 가능
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    // Supabase Admin 클라이언트로 모든 사용자 목록 가져오기
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

    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.error('Get users error:', usersError)
      return NextResponse.json({ success: false, error: '사용자 목록을 가져올 수 없습니다.' }, { status: 500 })
    }

    // 사용자 데이터 변환
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      role: user.user_metadata?.role || 'USER',
      createdAt: user.created_at,
      lastLoginAt: user.last_sign_in_at,
      isActive: user.email_confirmed_at ? true : false
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

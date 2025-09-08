import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ success: false, error: '필수 정보를 모두 입력해주세요.' }, { status: 400 })
    }

    // 개발 환경에서 이메일 확인 없이 사용자 생성
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 확인 건너뛰기
      user_metadata: {
        name: name,
        role: role
      }
    })

    if (authError) {
      console.error('Supabase Auth 사용자 생성 오류:', authError)
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: '사용자 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session
      },
      message: '사용자가 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Signup dev error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

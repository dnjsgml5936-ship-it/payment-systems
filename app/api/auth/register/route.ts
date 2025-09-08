import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name, role } = body

    if (!userId || !email || !name || !role) {
      return NextResponse.json({ success: false, error: '필수 정보를 모두 입력해주세요.' }, { status: 400 })
    }

    // Supabase Auth에서 사용자 정보 업데이트 (메타데이터로 역할 저장)
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          name: name,
          role: role
        }
      }
    )

    if (updateError) {
      console.error('Supabase Auth 업데이트 오류:', updateError)
      return NextResponse.json(
        { success: false, error: '사용자 정보 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userId,
        email: email,
        name: name,
        role: role
      },
      message: '사용자가 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Register user error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

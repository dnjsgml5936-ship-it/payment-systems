const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🔐 관리자 계정 생성 중...')
    
    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123!',
      email_confirm: true,
      user_metadata: {
        name: '관리자'
      }
    })

    if (authError) {
      console.error('❌ Auth 사용자 생성 실패:', authError.message)
      return
    }

    console.log('✅ Auth 사용자 생성 완료:', authData.user.email)

    // 2. Prisma를 사용하여 사용자 정보를 데이터베이스에 저장
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: '관리자',
        role: 'ADMIN'
      }
    })

    console.log('✅ 데이터베이스 사용자 생성 완료:', user.name)
    console.log('')
    console.log('🎉 관리자 계정이 성공적으로 생성되었습니다!')
    console.log('📧 이메일: admin@example.com')
    console.log('🔑 비밀번호: admin123!')
    console.log('👤 역할: 관리자')
    console.log('')
    console.log('🌐 http://localhost:3000/auth/login 에서 로그인하세요!')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
  }
}

createAdminUser()

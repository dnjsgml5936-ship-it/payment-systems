require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('환경 변수 (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)를 설정해주세요.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createApprover(email, name, role, password) {
  try {
    console.log(`\n🔍 ${name} 사용자 생성 중...`);
    
    // 1. Supabase Auth에 사용자 생성 (이메일 확인 건너뛰기)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 확인 건너뛰기
      user_metadata: {
        name,
        role,
      },
    });

    if (authError) {
      console.error(`❌ ${name} 사용자 생성 오류:`, authError.message);
      return;
    }

    console.log(`✅ ${name} 사용자 생성 완료:`);
    console.log(`   - 이메일: ${email}`);
    console.log(`   - 이름: ${name}`);
    console.log(`   - 역할: ${role}`);
    console.log(`   - 사용자 ID: ${authData.user.id}`);
    console.log(`   - 비밀번호: ${password}`);

    return authData.user;
  } catch (error) {
    console.error(`❌ ${name} 사용자 생성 중 오류 발생:`, error);
  }
}

async function main() {
  console.log('🚀 승인자 사용자 생성 시작...\n');

  const approvers = [
    {
      email: 'ahyun@company.com',
      name: '이아현',
      role: 'REPRESENTATIVE',
      password: 'ahyun123!'
    },
    {
      email: 'minsu@company.com',
      name: '김민수',
      role: 'VICE_REPRESENTATIVE',
      password: 'minsu123!'
    }
  ];

  for (const approver of approvers) {
    await createApprover(approver.email, approver.name, approver.role, approver.password);
  }

  console.log('\n🎉 모든 승인자 사용자 생성 완료!');
  console.log('\n📱 모바일 앱에서 사용할 로그인 정보:');
  console.log('이아현: ahyun@company.com / ahyun123!');
  console.log('김민수: minsu@company.com / minsu123!');
  console.log('\n💡 모바일 앱에서 로그인 후 승인 기능을 테스트해보세요!');
}

main();

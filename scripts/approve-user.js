require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('환경 변수 (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)를 설정해주세요.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function approveUser() {
  const email = 'dnjsgml5936@gmail.com';
  const name = '관리자';
  const role = 'ADMIN';

  try {
    console.log('🔍 사용자 정보 확인 중...');
    
    // 1. 기존 사용자 확인
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 사용자 목록 조회 오류:', listError.message);
      return;
    }

    const existingUser = users.users.find(user => user.email === email);
    
    if (existingUser) {
      console.log('✅ 기존 사용자 발견:', existingUser.email);
      console.log('📧 이메일 확인 상태:', existingUser.email_confirmed_at ? '확인됨' : '미확인');
      
      // 2. 이메일 확인 및 사용자 정보 업데이트
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          email_confirm: true, // 이메일 확인 강제 완료
          user_metadata: {
            name: name,
            role: role
          }
        }
      );

      if (updateError) {
        console.error('❌ 사용자 업데이트 오류:', updateError.message);
        return;
      }

      console.log('✅ 사용자 정보 업데이트 완료:');
      console.log('   - 이메일 확인: 완료');
      console.log('   - 이름:', name);
      console.log('   - 역할:', role);
      console.log('   - 사용자 ID:', existingUser.id);
      
    } else {
      console.log('⚠️ 기존 사용자를 찾을 수 없습니다. 새로 생성합니다...');
      
      // 3. 새 사용자 생성 (이메일 확인 자동 완료)
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'wnsla9182*',
        email_confirm: true, // 이메일 확인 자동 완료
        user_metadata: {
          name: name,
          role: role
        }
      });

      if (createError) {
        console.error('❌ 사용자 생성 오류:', createError.message);
        return;
      }

      console.log('✅ 새 사용자 생성 완료:');
      console.log('   - 이메일:', createData.user.email);
      console.log('   - 이름:', name);
      console.log('   - 역할:', role);
      console.log('   - 사용자 ID:', createData.user.id);
    }

    console.log('\n🎉 로그인 정보:');
    console.log('   이메일: dnjsgml5936@gmail.com');
    console.log('   비밀번호: wnsla9182*');
    console.log('   역할: 관리자');
    console.log('\n이제 http://localhost:3000/auth/login 에서 로그인할 수 있습니다!');

  } catch (error) {
    console.error('❌ 오류 발생: ', error);
  }
}

approveUser();

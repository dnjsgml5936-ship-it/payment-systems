import { supabase } from './supabase'

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  REPRESENTATIVE = 'REPRESENTATIVE',
  VICE_REPRESENTATIVE = 'VICE_REPRESENTATIVE',
  ACCOUNTANT = 'ACCOUNTANT',
  ADMIN = 'ADMIN'
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user || !session.access_token) {
      return null
    }

    // API를 통해 사용자 정보 가져오기 (토큰 포함)
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    if (!response.ok) {
      console.error('API auth/me failed:', response.status, response.statusText)
      return null
    }

    const userData = await response.json()
    return userData.success ? userData.data : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(requiredRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('인증이 필요합니다.')
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    throw new Error('접근 권한이 없습니다.')
  }

  return user
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // 세션이 제대로 설정되었는지 확인
  if (!data.session) {
    throw new Error('로그인 세션을 생성할 수 없습니다.')
  }

  // 사용자 정보가 있는지 확인
  if (!data.user) {
    throw new Error('사용자 정보를 가져올 수 없습니다.')
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function signUp(email: string, password: string, name: string, role: UserRole) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user) {
    // API를 통해 사용자 정보 저장
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: data.user.id,
        email: data.user.email,
        name,
        role,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '사용자 정보 저장에 실패했습니다.')
    }
  }

  return data
}

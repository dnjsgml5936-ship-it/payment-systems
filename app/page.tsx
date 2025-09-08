import { redirect } from 'next/navigation'

export default function HomePage() {
  // 임시로 로그인 페이지로 리다이렉트
  redirect('/auth/login')
}

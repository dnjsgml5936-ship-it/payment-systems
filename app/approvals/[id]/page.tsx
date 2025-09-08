import { redirect } from 'next/navigation'
import { getCurrentUser, requireAuth, UserRole } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import ApprovalDetail from '@/components/approvals/ApprovalDetail'

export default async function ApprovalDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth([UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ACCOUNTANT, UserRole.ADMIN])

  return (
    <Layout user={user}>
      <ApprovalDetail user={user} requestId={params.id} />
    </Layout>
  )
}

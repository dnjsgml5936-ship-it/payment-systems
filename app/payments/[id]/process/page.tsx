import { redirect } from 'next/navigation'
import { getCurrentUser, requireAuth, UserRole } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import PaymentProcessForm from '@/components/payments/PaymentProcessForm'

export default async function PaymentProcessPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth([UserRole.ACCOUNTANT, UserRole.ADMIN])

  return (
    <Layout user={user}>
      <PaymentProcessForm user={user} requestId={params.id} />
    </Layout>
  )
}

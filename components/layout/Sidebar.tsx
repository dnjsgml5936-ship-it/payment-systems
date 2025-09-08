'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { AuthUser, UserRole } from '@/lib/auth'
import {
  FileText,
  CheckCircle,
  DollarSign,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'

interface SidebarProps {
  user: AuthUser
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navigation: NavItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: BarChart3,
    roles: [UserRole.EMPLOYEE, UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ACCOUNTANT, UserRole.ADMIN],
  },
  {
    name: '정산결의서 작성',
    href: '/settlements/create',
    icon: FileText,
    roles: [UserRole.EMPLOYEE, UserRole.ADMIN],
  },
  {
    name: '내 정산결의서',
    href: '/settlements/my',
    icon: FileText,
    roles: [UserRole.EMPLOYEE, UserRole.ADMIN],
  },
  {
    name: '결재 대기',
    href: '/approvals/pending',
    icon: CheckCircle,
    roles: [UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ADMIN],
  },
  {
    name: '송금 처리',
    href: '/payments',
    icon: DollarSign,
    roles: [UserRole.ACCOUNTANT, UserRole.ADMIN],
  },
  {
    name: '사용자 관리',
    href: '/users',
    icon: Users,
    roles: [UserRole.ADMIN],
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.ADMIN],
  },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex flex-col flex-grow">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    {
                      'bg-primary-100 text-primary-900': isActive,
                      'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                    }
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      {
                        'text-primary-500': isActive,
                        'text-gray-400 group-hover:text-gray-500': !isActive,
                      }
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

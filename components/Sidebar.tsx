'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  {
    title: 'Visao Geral',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    title: 'Cadastros',
    items: [{ href: '/pessoas', label: 'Pessoas' }],
  },
  {
    title: 'Registros',
    items: [{ href: '/pesagens', label: 'Pesagens' }],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="Navegacao principal">
        {sections.map((section) => (
          <div key={section.title} className="sidebar__section">
            <p className="sidebar__section-title">{section.title}</p>
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`) ||
                (item.href === '/pessoas' && pathname.startsWith('/pessoa/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar__link ${active ? 'sidebar__link--active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}

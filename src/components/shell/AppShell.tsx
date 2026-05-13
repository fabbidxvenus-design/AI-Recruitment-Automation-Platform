'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AppShell.module.css';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Pipeline',
    items: [
      { label: 'Recruitment Dashboard', href: '/dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Candidates',
    items: [
      { label: 'Sourcing & Import', href: '/candidates/import', icon: '📥' },
      { label: 'Screening Review', href: '/screening/review', icon: '✅' },
    ],
  },
  {
    title: 'Interviews',
    items: [
      { label: 'Schedule Approval', href: '/interviews/schedule-approval', icon: '📅' },
      { label: 'AI Interview Workspace', href: '/portal/interview/demo-token', icon: '🤖' },
    ],
  },
  {
    title: 'Assessment',
    items: [
      { label: 'Test Grading', href: '/tests/grading', icon: '📝' },
      { label: 'Final Review', href: '/final-review', icon: '🎯' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Configuration & Monitoring', href: '/admin', icon: '⚙️' },
      { label: 'Error Remediation', href: '/errors/ERR-2024-0892', icon: '🔧' },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside className={styles.sidebar} role="navigation" aria-label="Main navigation">
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>R</span>
            <span className={styles.logoText}>RecruitAI</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section) => (
            <div key={section.title} className={styles.navSection}>
              <h2 className={styles.navSectionTitle}>{section.title}</h2>
              <ul className={styles.navList}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                        <span className={styles.navLabel}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>HR</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>HR Manager</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <span className={styles.topbarBreadcrumb}>RecruitAI</span>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.topbarButton} type="button" aria-label="Notifications">
              <span>🔔</span>
            </button>
            <button className={styles.topbarButton} type="button" aria-label="Settings">
              <span>⚙️</span>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
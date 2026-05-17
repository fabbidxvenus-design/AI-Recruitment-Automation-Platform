'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import styles from './AppShell.module.css';

interface NavItem {
  labelKey: string;
  href: string;
  icon?: string;
}

const navSectionsMeta: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: 'nav.pipeline',
    items: [{ labelKey: 'nav.dashboard', href: '/dashboard', icon: '📊' }],
  },
  {
    titleKey: 'nav.candidates',
    items: [
      { labelKey: 'nav.sourcingImport', href: '/candidates/import', icon: '📥' },
      { labelKey: 'nav.screeningReview', href: '/screening/review', icon: '✅' },
    ],
  },
  {
    titleKey: 'nav.jobs',
    items: [
      { labelKey: 'nav.jobIntake', href: '/jobs/intake', icon: '📋' },
      { labelKey: 'nav.jdApproval', href: '/jobs/approval', icon: '🧾' },
      { labelKey: 'nav.jdVersions', href: '/jobs/versions', icon: '📜' },
    ],
  },
  {
    titleKey: 'nav.interviews',
    items: [
      { labelKey: 'nav.scheduleApproval', href: '/interviews/schedule-approval', icon: '📅' },
      { labelKey: 'nav.aiWorkspace', href: '/portal/interview/access', icon: '🤖' },
    ],
  },
  {
    titleKey: 'nav.assessment',
    items: [
      { labelKey: 'nav.assessmentSetup', href: '/assessments/setup', icon: '🧩' },
      { labelKey: 'nav.testGrading', href: '/tests/grading', icon: '📝' },
      { labelKey: 'nav.finalReview', href: '/final-review', icon: '🎯' },
    ],
  },
  {
    titleKey: 'nav.tools',
    items: [{ labelKey: 'nav.aiTools', href: '/tools', icon: '🛠️' }],
  },
  {
    titleKey: 'nav.admin',
    items: [
      { labelKey: 'nav.configMonitoring', href: '/admin', icon: '⚙️' },
      { labelKey: 'nav.errorRemediation', href: '/errors/ERR-2024-0892', icon: '🔧' },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguage();

  const targetLocale = locale === 'vi' ? 'en' : 'vi';
  const targetLanguageLabel = targetLocale === 'vi' ? t('language.vietnamese') : t('language.english');
  const languageSwitchLabel = t('language.switchToLanguage', { language: targetLanguageLabel });

  const handleLanguageSwitch = () => {
    setLocale(targetLocale);
  };

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        {t('sidebar.skipLink')}
      </a>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>R</span>
            <span className={styles.logoText}>{t('app.title')}</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label={t('nav.mainAriaLabel')}>
          {navSectionsMeta.map((section) => (
            <div key={section.titleKey} className={styles.navSection}>
              <h2 className={styles.navSectionTitle}>{t(section.titleKey)}</h2>
              <ul className={styles.navList}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href === '/tools' && pathname.startsWith('/tools/'));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.icon && <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>}
                        <span className={styles.navLabel}>{t(item.labelKey)}</span>
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
              <span className={styles.userName}>{t('sidebar.hrManager')}</span>
              <span className={styles.userRole}>{t('sidebar.administrator')}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className={styles.main}>
        <header className={styles.topbar} aria-label="Top bar">
          <div className={styles.topbarTitle}>
            <span className={styles.topbarBreadcrumb}>{t('app.title')}</span>
          </div>
          <div className={styles.topbarActions}>
            <button
              className={styles.langSwitch}
              type="button"
              onClick={handleLanguageSwitch}
              aria-label={languageSwitchLabel}
              title={languageSwitchLabel}
            >
              {targetLocale.toUpperCase()}
            </button>
            <button className={styles.topbarButton} type="button" aria-label={t('topbar.notifications')}>
              <span aria-hidden="true">🔔</span>
            </button>
            <button className={styles.topbarButton} type="button" aria-label={t('topbar.settings')}>
              <span aria-hidden="true">⚙️</span>
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
'use client';

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MetricCard.module.css';

type MetricVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  trend?: 'up' | 'down';
  variant?: MetricVariant;
}

export function MetricCard({
  label,
  value,
  icon,
  change,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.metricCard} ${variant !== 'default' ? styles[variant] : ''}`} role="group" aria-label={label || 'Metric'}>
      <div className={styles.metricHeader}>
        <span className={styles.metricLabel}>{label}</span>
        {icon && <span className={styles.metricIcon} aria-hidden="true">{icon}</span>}
      </div>
      <span className={styles.metricValue}>{value}</span>
      {(change || trend) && (
        <div className={styles.metricFooter}>
          {trend && (
            <span className={`${styles.metricTrend} ${trend === 'up' ? styles.trendUp : styles.trendDown}`}>
              <span className="sr-only">{t(`common.trend.${trend}`)}</span>
              <span aria-hidden="true">{trend === 'up' ? '↑' : '↓'}</span>
            </span>
          )}
          {change && <span className={styles.metricChange}>{change}</span>}
        </div>
      )}
    </div>
  );
}
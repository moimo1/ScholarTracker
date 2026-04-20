'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();
  
  // Create a pleasant title from pathname
  const generateTitle = () => {
    if (pathname === '/scholar') return 'Overview';
    if (pathname?.includes('submissions')) return 'Document Submissions';
    if (pathname?.includes('settings')) return 'Account Settings';
    return 'Dashboard';
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{generateTitle()}</h1>

      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Search">
          <Search size={18} />
        </button>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

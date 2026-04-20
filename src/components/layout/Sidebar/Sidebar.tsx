'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, FileText, Settings, LogOut, GraduationCap } from 'lucide-react';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getNavItems = () => {
    // Determine route prefix based on role if needed.
    // For now, defaulting to scholar routes if user role is SCHOLAR.
    return [
      { name: 'Dashboard', href: '/scholar', icon: <LayoutDashboard size={20} /> },
      { name: 'Submissions', href: '/scholar/submissions', icon: <FileText size={20} /> },
      { name: 'Settings', href: '/scholar/settings', icon: <Settings size={20} /> },
    ];
  };

  const navItems = getNavItems();
  const userName = session?.user?.name || 'Guest User';
  const role = session?.user?.role || 'user';
  const avatarInitials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <GraduationCap className={styles.brandIcon} size={32} />
        <span className="text-gradient">Scholars</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/scholar');
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>{avatarInitials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{role.toLowerCase().replace('_', ' ')}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
             <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

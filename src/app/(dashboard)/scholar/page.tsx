import React from 'react';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { CheckCircle, Clock, FileText, Upload, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ScholarOverview() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const documents = await db.document.findMany({
    where: { scholarId: session.user.id },
    orderBy: { submittedAt: 'desc' },
  });

  const totalDocs = documents.length;
  const pending = documents.filter(d => d.status === 'pending').length;
  const approved = documents.filter(d => d.status === 'approved').length;

  return (
    <div className={styles.container}>
      <header className={styles.welcomeSection}>
        <h1 className={styles.greeting}>
          Welcome back, <span className="text-gradient-primary">{session.user.name?.split(' ')[0] || 'Scholar'}!</span>
        </h1>
        <p className={styles.subtitle}>Here is your scholarship progress and recent activity.</p>
      </header>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard} hoverable>
          <CardContent>
            <div className={styles.statLabel}>Total Submissions</div>
            <div className={styles.statValue}>{totalDocs}</div>
          </CardContent>
        </Card>

        <Card className={styles.statCard} hoverable>
          <CardContent>
            <div className={styles.statLabel}>Pending Actions</div>
            <div className={styles.statValue}>{pending}</div>
          </CardContent>
        </Card>

        <Card className={styles.statCard} hoverable>
          <CardContent>
            <div className={styles.statLabel}>Approved Documents</div>
            <div className={styles.statValue}>{approved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Tracker */}
      <section className={styles.timelineSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Progress Tracker</h2>
          <Link 
            href="/scholar/submissions"
            className="btn primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--text-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500 }}
          >
            <Upload size={16} />
            Submit Document
          </Link>
        </div>

        <div className={styles.timeline}>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No submissions yet. Submit your first document to get started.</p>
          ) : documents.map((item) => {
            let Icon = FileText;
            if (item.status === 'approved') Icon = CheckCircle;
            if (item.status === 'pending') Icon = Clock;
            if (item.status === 'reviewed') Icon = AlertCircle;

            return (
              <div key={item.id} className={styles.timelineItem} data-status={item.status}>
                <div className={styles.timelineIconWrapper}>
                  <Icon size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <Card className={styles.timelineCard} hoverable>
                    <CardContent>
                      <div className={styles.timelineHeader}>
                        <h4 className={styles.timelineTitle}>{item.title}</h4>
                        <span className={styles.timelineDate}>{new Date(item.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
                        Type: <span style={{ textTransform: 'capitalize' }}>{item.type}</span> 
                        {item.notes ? ` • ${item.notes}` : ''}
                      </p>
                      <span className={`${styles.statusBadge} ${styles[`badge-${item.status}`]}`}>
                        {item.status}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import styles from '../auth.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/scholar');
      router.refresh();
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your Scholar Tracker account</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Email Address</label>
          <input 
            type="email" 
            className={styles.input} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input 
            type="password" 
            className={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" variant="primary" isLoading={loading} style={{ marginTop: '0.5rem' }}>
          Sign in
        </Button>
      </form>

      <p className={styles.footerText}>
        Don't have an account? <Link href="/register" className={styles.link}>Register here</Link>
      </p>
    </div>
  );
}

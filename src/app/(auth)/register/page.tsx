'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import styles from '../auth.module.css';

export default function Register() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }

      // Registration successful, redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>Create an Account</h1>
      <p className={styles.subtitle}>Register entirely locally as a Scholar</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
            />
          </div>
        </div>

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
          Create Account
        </Button>
      </form>

      <p className={styles.footerText}>
        Already have an account? <Link href="/login" className={styles.link}>Sign in here</Link>
      </p>
    </div>
  );
}

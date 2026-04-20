'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { UploadCloud, File } from 'lucide-react';
import styles from './page.module.css';

type GradeRow = { id: string; course: string; units: string; grade: string };

export default function DocumentSubmission() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const [docType, setDocType] = useState('');
  const [rawOCR, setRawOCR] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [tabularGrades, setTabularGrades] = useState<GradeRow[]>([]);

  // Automatically scan file when docType changes if file already uploaded
  useEffect(() => {
    if (file && file.type.startsWith('image/') && docType) {
      scanFileWithGemini(file, docType);
    }
  }, [docType]);

  const scanFileWithGemini = async (selectedFile: File, selectedDocType: string) => {
    setScanning(true);
    try {
      const { extractDocumentData } = await import('@/app/actions/extract');
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('docType', selectedDocType);
      
      const data = await extractDocumentData(fd);

      if (selectedDocType === 'transcript') {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any, i: number) => ({
             id: String(Date.now() + i),
             course: d.course || '',
             units: String(d.units || ''),
             grade: d.grade || ''
          }));
          setTabularGrades(formatted);
        } else {
          setTabularGrades([{ id: '1', course: '', units: '', grade: '' }]);
        }
        setExtractedText('');
      } else {
        setExtractedText(typeof data === 'string' ? data : '');
        setTabularGrades([]);
      }
    } catch (err) {
      console.error("Gemini Scanning Failed", err);
    }
    setScanning(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/') && docType) {
         scanFileWithGemini(selectedFile, docType);
      } else if (!docType) {
         // User didn't pick docType yet, it will scan automatically via useEffect when they do
      } else {
         setRawOCR('');
      }
    }
  };

  const updateRow = (id: string, field: keyof GradeRow, value: string) => {
    setTabularGrades(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const addRow = () => setTabularGrades(prev => [...prev, { id: String(Date.now()), course: '', units: '', grade: '' }]);
  const removeRow = (id: string) => setTabularGrades(prev => prev.filter(r => r.id !== id));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set('file', file);
      
      const { submitDocumentAction } = await import('@/app/actions/submissions');
      await submitDocumentAction(formData);
      
      router.push('/scholar');
      router.refresh(); 
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Submit Document</h1>
        <p className={styles.subtitle}>Upload your required tracking documents for review.</p>
      </header>

      <Card>
        <CardContent>
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            
            <div className={styles.field}>
              <label className={styles.label}>Document Type</label>
              <select name="type" className={styles.select} required value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="" disabled>Select a document type...</option>
                <option value="transcript">Official Transcript</option>
                <option value="enrollment">Proof of Enrollment</option>
                <option value="receipt">Tuition Receipt</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Upload File</label>
              <div className={styles.dropzone}>
                <input 
                  type="file" 
                  className={styles.fileInput} 
                  onChange={handleFileChange} 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {!file ? (
                  <>
                    <UploadCloud size={48} className={styles.dropzoneIcon} />
                    <p className={styles.dropzoneText}>Drag & drop your file here, or click to browse</p>
                    <p className={styles.dropzoneSub}>Supports PDF, JPG, PNG up to 10MB</p>
                  </>
                ) : (
                  <>
                    <File size={48} className={styles.dropzoneIcon} style={{ color: 'var(--status-approved)', background: 'rgba(16, 185, 129, 0.1)' }} />
                    <p className={styles.dropzoneText}>{file.name}</p>
                    <p className={styles.dropzoneSub}>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                  </>
                )}
              </div>
            </div>

            {/* Editable OCR Table for Transcripts */}
            {docType === 'transcript' && tabularGrades.length > 0 && (
              <div className={styles.field}>
                <label className={styles.label} style={{ color: 'var(--text-primary)' }}>
                  Verified Transcript Data <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>(Edit rows to correct OCR errors)</span>
                </label>
                <div style={{ border: '1px solid var(--border-light)', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem' }}>Course / Subject</th>
                        <th style={{ padding: '0.75rem', width: '80px' }}>Units</th>
                        <th style={{ padding: '0.75rem', width: '80px' }}>Grade</th>
                        <th style={{ padding: '0.75rem', width: '50px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabularGrades.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.5rem' }}>
                            <input type="text" value={row.course} onChange={(e) => updateRow(row.id, 'course', e.target.value)} style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-main)' }} />
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <input type="text" value={row.units} onChange={(e) => updateRow(row.id, 'units', e.target.value)} style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-main)' }} />
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <input type="text" value={row.grade} onChange={(e) => updateRow(row.id, 'grade', e.target.value)} style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-main)' }} />
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <button type="button" onClick={() => removeRow(row.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)' }}>
                     <button type="button" onClick={addRow} style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>+ Add Row</button>
                  </div>
                </div>
                <input type="hidden" name="gradesData" value={JSON.stringify(tabularGrades)} />
              </div>
            )}

            {/* Standard OCR Textarea for non-transcripts */}
            {docType !== 'transcript' && extractedText && (
              <div className={styles.field}>
                <label className={styles.label} style={{ color: 'var(--text-primary)' }}>
                  Verified OCR Text <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>(Edit if automated scan was incorrect)</span>
                </label>
                <textarea 
                  name="extractedText"
                  className={styles.textarea} 
                  style={{ borderColor: 'var(--status-reviewed)', background: 'rgba(59, 130, 246, 0.05)' }}
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Additional Notes (Optional)</label>
              <textarea 
                name="notes"
                className={styles.textarea} 
                placeholder="Include any context the field manager or director should know..."
              />
            </div>

            <div className={styles.buttonRow}>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={loading} disabled={!file || scanning}>
                {scanning ? "Scanning document..." : "Submit Document"}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

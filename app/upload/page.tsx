'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import PageHeader from '../../components/PageHeader';

interface UploadedFile {
  name: string;
  size: string;
  status: 'processing' | 'done' | 'error';
  score?: number;
  skills?: string[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const mockSkillSets = [
  ['React', 'TypeScript', 'Node.js', 'GraphQL'],
  ['Python', 'ML', 'TensorFlow', 'SQL'],
  ['Figma', 'UX Research', 'Prototyping', 'CSS'],
  ['Java', 'Spring Boot', 'Microservices', 'AWS'],
  ['Product', 'Roadmap', 'Agile', 'Analytics'],
  ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function simulateProcessing(fileList: File[]) {
    const newFiles: UploadedFile[] = fileList.map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
      status: 'processing',
    }));
    setFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach((_, i) => {
      const idx = files.length + i;
      setTimeout(() => {
        setFiles(prev => prev.map((f, fi) =>
          fi === idx
            ? {
                ...f,
                status: Math.random() > 0.05 ? 'done' : 'error',
                score: Math.floor(Math.random() * 55) + 40,
                skills: mockSkillSets[idx % mockSkillSets.length],
              }
            : f
        ));
      }, 1500 + i * 400);
    });
  }

  function handleFiles(fileList: FileList) {
    const arr = Array.from(fileList).filter(f =>
      f.type === 'application/pdf' ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      f.type === 'application/msword' ||
      f.type.startsWith('image/')
    );
    if (arr.length) simulateProcessing(arr);
  }

  const done = files.filter(f => f.status === 'done').length;
  const processing = files.filter(f => f.status === 'processing').length;

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="Career Pathway" />
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Upload CVs
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
            Upload PDF, Word documents, or images. AI will analyze and extract candidate profiles automatically.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className="card"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#1d4ed8' : '#d1d5db'}`,
            background: dragging ? '#eff6ff' : 'white',
            borderRadius: '14px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '2rem',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📂</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            Drop CVs here or click to browse
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Supports PDF, Word (.docx), and images (JPG, PNG) — bulk upload 20+ files at once
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['PDF', 'DOCX', 'DOC', 'JPG', 'PNG'].map(ext => (
              <span key={ext} style={{
                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                background: '#f3f4f6', color: '#374151',
              }}>{ext}</span>
            ))}
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Choose Files
          </button>
        </div>

        {/* Progress summary */}
        {files.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1d4ed8' }}>{files.length}</span>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Uploaded</div>
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{done}</span>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Processed</div>
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{processing}</span>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Processing</div>
            </div>
            {done > 0 && (
              <Link href="/matches" className="btn-primary" style={{ marginLeft: 'auto' }}>
                View Matches →
              </Link>
            )}
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
              Uploaded Files
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem',
                  background: '#f9fafb', borderRadius: '8px', flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                    {f.name.endsWith('.pdf') ? '📄' : f.name.match(/\.(jpg|jpeg|png)$/i) ? '🖼️' : '📝'}
                  </span>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{f.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{f.size}</div>
                  </div>
                  {f.status === 'processing' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem' }}>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                      <span>AI Processing…</span>
                    </div>
                  )}
                  {f.status === 'done' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {f.skills?.slice(0, 3).map(sk => (
                          <span key={sk} style={{
                            background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px',
                            padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                          }}>{sk}</span>
                        ))}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                        background: (f.score ?? 0) >= 70 ? '#d1fae5' : (f.score ?? 0) >= 40 ? '#dbeafe' : '#fee2e2',
                        color: (f.score ?? 0) >= 70 ? '#065f46' : (f.score ?? 0) >= 40 ? '#1e40af' : '#991b1b',
                      }}>
                        {f.score}% match
                      </span>
                      <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓ Done</span>
                    </div>
                  )}
                  {f.status === 'error' && (
                    <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>✗ Error</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

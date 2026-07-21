'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

type FlowStep = 'intro' | 'qa' | 'generating' | 'result';

const QA = [
  {
    id: 'job',
    icon: '💼',
    label: 'Le Poste',
    question: 'Pour quel poste souhaitez-vous postuler ?',
    helper: 'Indiquez le titre du poste tel qu\'il apparaît dans l\'annonce.',
    placeholder: 'Ex: Vendeur, Caissier, Agent administratif...',
    suggestions: [
      'Vendeur / Vendeuse',
      'Caissier(ère)',
      'Agent de sécurité',
      'Livreur / Livreuse',
      'Ouvrier(ère) de production',
      'Maçon / Aide maçon',
      'Chauffeur',
      'Serveur / Serveuse',
      'Secrétaire',
      'Agent administratif',
    ],
    optional: false,
  },
  {
    id: 'company',
    icon: '🏢',
    label: 'L\'Entreprise',
    question: 'Quel est le nom de l\'entreprise (facultatif) ?',
    helper: 'Si vous connaissez l\'entreprise, écrivez le nom. Sinon, appuyez sur "Suivant".',
    placeholder: 'Ex: Marjane, Label Vie, Cosumar... ou laissez vide',
    suggestions: [],
    optional: true,
  },
  {
    id: 'experience',
    icon: '📋',
    label: 'Votre Expérience',
    question: 'Parlez-nous de votre expérience en quelques mots simples.',
    helper: 'Pas besoin d\'être formel — dites simplement ce que vous avez fait ou qui vous êtes.',
    placeholder: 'Ex: J\'ai travaillé 2 ans comme vendeur, je suis dynamique et ponctuel...',
    suggestions: [
      'Je débute, c\'est mon premier emploi',
      'J\'ai quelques mois d\'expérience',
      'J\'ai 1 à 2 ans d\'expérience dans ce domaine',
      'J\'ai plus de 3 ans d\'expérience',
    ],
    optional: false,
  },
  {
    id: 'motivation',
    icon: '❤️',
    label: 'Votre Motivation',
    question: 'Pourquoi voulez-vous ce poste / travailler dans cette entreprise ?',
    helper: 'Répondez simplement et sincèrement — l\'IA embellira votre réponse.',
    placeholder: 'Ex: Je cherche un emploi stable, j\'aime le contact avec les clients...',
    suggestions: [
      'Je cherche un emploi stable et sérieux',
      'Ce secteur me passionne depuis longtemps',
      'Je veux progresser et évoluer dans ma carrière',
      'L\'entreprise est reconnue et j\'aimerais en faire partie',
      'Je suis motivé(e) et prêt(e) à apprendre',
    ],
    optional: false,
  },
];

async function callAI(
  messages: { role: string; content: string }[],
  system: string,
  signal?: AbortSignal,
): Promise<string> {
  const r = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system, task: 'fast', max_tokens: 350 }),
    signal,
  });
  const d = await r.json();
  return d.content?.[0]?.text || '';
}

function buildFallback(ans: Record<string, string>, name: string, phone: string, email: string): string {
  const company = ans.company ? `votre entreprise ${ans.company}` : 'votre entreprise';
  const expLine = !ans.experience || ans.experience.toLowerCase().includes('premier') || ans.experience.toLowerCase().includes('débu')
    ? "Bien que débutant(e) dans ce domaine, je suis motivé(e), sérieux(se) et prêt(e) à apprendre rapidement."
    : `Fort(e) de mon expérience — ${ans.experience} — je suis en mesure d'apporter une contribution immédiate.`;
  const motLine = ans.motivation || "Je suis convaincu(e) que ma motivation et mon sérieux constituent des atouts précieux.";
  return `Madame, Monsieur,

J'ai l'honneur de vous adresser ma candidature pour le poste de ${ans.job || 'collaborateur(trice)'}. ${expLine}

Votre annonce a retenu toute mon attention car ${motLine.charAt(0).toLowerCase() + motLine.slice(1)}. Je souhaite vivement rejoindre ${company} et y contribuer pleinement à vos objectifs.

Disponible immédiatement et ouvert(e) à tout entretien à votre convenance, je reste à votre disposition pour tout complément d'information. Je vous remercie de l'attention que vous porterez à ma candidature.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${name}${phone ? '\n' + phone : ''}${email ? '\n' + email : ''}`;
}

export default function EmailGenerator() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [flow, setFlow] = useState<FlowStep>('intro');
  const [qaIndex, setQaIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'candidate')) router.push('/login');
  }, [user, initialized, router]);

  useEffect(() => {
    if (!user) return;
    try {
      const s = localStorage.getItem(`tm_info_${user.idNumber}`);
      if (s) setInfo(JSON.parse(s));
    } catch {}
  }, [user]);

  if (!initialized || !user || user.role !== 'candidate') return null;

  const firstName = info?.firstName || user.name.split(' ')[0] || 'Candidat';
  const currentQ = QA[qaIndex];

  const handleSuggestion = (s: string) => {
    setCurrentInput(s);
    textareaRef.current?.focus();
  };

  const handleNext = () => {
    const val = currentInput.trim();
    if (!val && !currentQ.optional) return;
    const next = { ...answers, [currentQ.id]: val };
    setAnswers(next);
    setCurrentInput('');
    if (qaIndex < QA.length - 1) {
      setQaIndex(i => i + 1);
    } else {
      generateEmail(next);
    }
  };

  const generateEmail = useCallback(async (ans: Record<string, string>) => {
    setFlow('generating');
    setError('');
    setElapsed(0);
    setUsedFallback(false);

    // Live elapsed-second counter
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

    const name = `${info?.firstName || ''} ${info?.lastName || ''}`.trim() || user.name;
    const phone = info?.phone || '';
    const email = user.email || '';

    const system = `Rédige une lettre de candidature formelle en français. RÈGLES STRICTES:
- 3 paragraphes. Commencer par "Madame, Monsieur,". Terminer par "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
- Signature: nom complet, téléphone, email. Si entreprise vide, écrire "votre entreprise".
- Maximum 160 mots. Prête à envoyer. Aucun commentaire ni explication.`;

    const content = `Poste: ${ans.job || 'Non précisé'}
Entreprise: ${ans.company || ''}
Expérience: ${ans.experience || 'Débutant'}
Motivation: ${ans.motivation || 'Motivé à travailler'}
Nom: ${name}
Tél: ${phone}
Email: ${email}`;

    // Hard 8-second deadline — if AI takes longer, use local fallback
    const ctrl = new AbortController();
    const hardDeadline = setTimeout(() => ctrl.abort(), 8000);

    try {
      let text = '';
      // Try twice with no delay between attempts (abort signal stops them both)
      for (let attempt = 0; attempt < 2 && !text; attempt++) {
        try {
          text = await callAI([{ role: 'user', content }], system, ctrl.signal);
        } catch {
          // continue to next attempt or fallback
        }
      }
      clearTimeout(hardDeadline);
      clearTimer();
      if (!text) {
        // Deadline hit or all attempts failed — use instant local fallback
        setUsedFallback(true);
        text = buildFallback(ans, name, phone, email);
      }
      setGeneratedEmail(text);
      setFlow('result');
    } catch {
      clearTimeout(hardDeadline);
      clearTimer();
      // Always show something — never leave user waiting
      setUsedFallback(true);
      setGeneratedEmail(buildFallback(ans, name, phone, email));
      setFlow('result');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info, user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generatedEmail;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedEmail], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lettre_Candidature_${answers.job?.replace(/\s+/g, '_') || 'Emploi'}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const restart = () => {
    setFlow('intro');
    setQaIndex(0);
    setAnswers({});
    setCurrentInput('');
    setGeneratedEmail('');
    setCopied(false);
    setError('');
  };

  // ─── Shared layout wrapper ────────────────────────────────────────────────
  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <main style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Navbar */}
      <nav style={{
        background: '#0a1f5c', height: 60, padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 16px rgba(10,31,92,.45)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/candidate" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,.55)', fontSize: '0.82rem', fontWeight: 600 }}>
            ← Tableau de bord
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff' }}>
            {firstName[0]?.toUpperCase()}
          </div>
          <span style={{ color: 'rgba(255,255,255,.8)', fontSize: '0.82rem', fontWeight: 600 }}>{firstName}</span>
        </div>
      </nav>
      {children}
    </main>
  );

  // ─── INTRO SCREEN ─────────────────────────────────────────────────────────
  if (flow === 'intro') return (
    <Wrap>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.25rem 5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(124,58,237,.35)',
        }}>✉️</div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Votre lettre de candidature en 2 minutes
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.7, maxWidth: 440, marginBottom: '2rem' }}>
          L'IA vous pose <strong style={{ color: '#111827' }}>4 questions simples</strong> sur le poste que vous visez, puis rédige pour vous une lettre professionnelle et formelle <strong style={{ color: '#111827' }}>prête à envoyer</strong>.
        </p>

        {/* Steps preview */}
        <div style={{ width: '100%', background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          {QA.map((q, i) => (
            <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', padding: '0.7rem 0', borderBottom: i < QA.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg,#7c3aed18,#2563eb18)',
                border: '1.5px solid #7c3aed25',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {q.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '0.15rem' }}>{q.label}</p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{q.question}</p>
              </div>
              <span style={{
                marginLeft: 'auto', flexShrink: 0,
                padding: '0.15rem 0.55rem', borderRadius: 9999,
                background: '#f3f4f6', color: '#9ca3af',
                fontSize: '0.65rem', fontWeight: 700,
              }}>
                {i + 1}/{QA.length}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setFlow('qa')}
          style={{
            width: '100%', maxWidth: 360,
            padding: '1rem 2rem',
            borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(124,58,237,.4)',
            transition: 'transform .15s, box-shadow .15s',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(124,58,237,.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,.4)'; }}
        >
          Commencer gratuitement →
        </button>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>Gratuit · Aucune inscription requise</p>
      </div>
    </Wrap>
  );

  // ─── Q&A SCREEN ───────────────────────────────────────────────────────────
  if (flow === 'qa') {
    const progress = ((qaIndex) / QA.length) * 100;
    const canSkip = currentQ.optional;
    const canContinue = currentInput.trim().length > 0 || canSkip;

    return (
      <Wrap>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                Question {qaIndex + 1} sur {QA.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {Math.round(((qaIndex + 1) / QA.length) * 100)}%
              </span>
            </div>
            <div style={{ height: 5, background: '#e5e7eb', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 9999,
                background: 'linear-gradient(90deg,#7c3aed,#2563eb)',
                width: `${((qaIndex + 1) / QA.length) * 100}%`,
                transition: 'width .4s ease',
              }} />
            </div>
          </div>

          {/* Question card */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e5e7eb', padding: '2rem', marginBottom: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
            {/* Step icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: '1.25rem',
              background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 4px 16px rgba(124,58,237,.3)',
            }}>
              {currentQ.icon}
            </div>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
              {currentQ.label}
            </p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.02em', lineHeight: 1.35 }}>
              {currentQ.question}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {currentQ.helper}
              {currentQ.optional && <em style={{ color: '#c4b5fd' }}> (Facultatif)</em>}
            </p>

            {/* Suggestions */}
            {currentQ.suggestions.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                  Suggestions rapides
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {currentQ.suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: 9999,
                        border: `1.5px solid ${currentInput === s ? '#7c3aed' : '#e5e7eb'}`,
                        background: currentInput === s ? '#f5f3ff' : '#f9fafb',
                        color: currentInput === s ? '#7c3aed' : '#374151',
                        fontSize: '0.82rem',
                        fontWeight: currentInput === s ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text input */}
            <textarea
              ref={textareaRef}
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              placeholder={currentQ.placeholder}
              rows={3}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleNext(); }}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 12,
                border: `2px solid ${currentInput.trim() ? '#7c3aed40' : '#e5e7eb'}`,
                background: currentInput.trim() ? '#faf5ff' : '#f9fafb',
                fontSize: '0.9rem',
                color: '#111827',
                resize: 'vertical' as const,
                lineHeight: 1.6,
                transition: 'border-color .2s, background .2s',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed60'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,.08)'; }}
              onBlur={e => { e.target.style.borderColor = currentInput.trim() ? '#7c3aed40' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
            <p style={{ fontSize: '0.72rem', color: '#c4b5fd', marginTop: '0.4rem' }}>
              Ctrl + Entrée pour continuer
            </p>

            {error && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 10, background: '#fff1f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem' }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {qaIndex > 0 && (
              <button
                onClick={() => { setQaIndex(i => i - 1); setCurrentInput(answers[QA[qaIndex - 1].id] || ''); }}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  background: '#fff',
                  color: '#374151',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ← Retour
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canContinue}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: 12,
                background: canContinue ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#e5e7eb',
                color: canContinue ? '#fff' : '#9ca3af',
                fontSize: '0.95rem',
                fontWeight: 800,
                border: 'none',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                boxShadow: canContinue ? '0 4px 20px rgba(124,58,237,.35)' : 'none',
                transition: 'all .2s',
                letterSpacing: '-0.01em',
              }}
            >
              {qaIndex < QA.length - 1
                ? (canSkip && !currentInput.trim() ? 'Passer →' : 'Suivant →')
                : '✨ Générer ma lettre →'}
            </button>
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
            {QA.map((_, i) => (
              <div key={i} style={{
                width: i === qaIndex ? 22 : 7,
                height: 7,
                borderRadius: 9999,
                background: i < qaIndex ? '#7c3aed' : i === qaIndex ? 'linear-gradient(90deg,#7c3aed,#2563eb)' : '#e5e7eb',
                transition: 'all .3s',
              }} />
            ))}
          </div>
        </div>
      </Wrap>
    );
  }

  // ─── GENERATING SCREEN ────────────────────────────────────────────────────
  if (flow === 'generating') return (
    <Wrap>
      <style>{`
        @keyframes spin2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-10px)}}
        @keyframes barFill { from{width:0%} to{width:90%} }
      `}</style>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 2rem',
          background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, animation: 'spin2 2s ease infinite',
          boxShadow: '0 8px 40px rgba(124,58,237,.45)' }}>✉️</div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
          L'IA rédige votre lettre…
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 1.5rem' }}>
          Analyse de vos réponses en cours — prête dans quelques secondes.
        </p>

        {/* Progress bar (pseudo-animation to 90% over 8s) */}
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 9999, overflow: 'hidden', margin: '0 auto 1rem', maxWidth: 280 }}>
          <div style={{ height: '100%', borderRadius: 9999,
            background: 'linear-gradient(90deg,#7c3aed,#2563eb)',
            animation: 'barFill 8s linear forwards' }} />
        </div>

        {/* Live elapsed counter */}
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
          {elapsed < 3 ? '⚡ Connexion à l\'IA…' : elapsed < 6 ? '✍️ Rédaction en cours…' : '🔄 Finalisation…'}
          <span style={{ marginLeft: '0.4rem', fontWeight: 700, color: '#7c3aed' }}>{elapsed}s</span>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: '50%',
              background: '#7c3aed', animation: `bounce 1s ease ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </Wrap>
  );

  // ─── RESULT SCREEN ────────────────────────────────────────────────────────
  return (
    <Wrap>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        {/* Success header */}
        <div style={{
          background: 'linear-gradient(135deg,#1a1060,#2563eb)',
          borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,.3)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✅</div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 700 }}>Lettre générée</p>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Votre candidature est prête !</h2>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>
              Poste : <strong style={{ color: '#fff' }}>{answers.job}</strong>
              {answers.company && <> · Entreprise : <strong style={{ color: '#fff' }}>{answers.company}</strong></>}
            </p>
          </div>
        </div>

        {/* Email card */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1.5px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,.07)',
          overflow: 'hidden', marginBottom: '1.25rem',
        }}>
          {/* Card header */}
          <div style={{
            padding: '0.85rem 1.25rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
              ✉️ Lettre de Candidature
            </span>
            <span style={{
              marginLeft: 'auto', padding: '0.15rem 0.55rem', borderRadius: 9999,
              background: usedFallback ? '#fff7ed' : '#f0fdf4',
              color: usedFallback ? '#c2410c' : '#15803d',
              fontSize: '0.68rem', fontWeight: 700,
            }}>
              {usedFallback ? '✏️ À personnaliser' : 'Prête à copier'}
            </span>
          </div>
          {/* Email body */}
          <div style={{
            padding: '1.75rem 2rem',
            fontFamily: 'Georgia, serif',
            fontSize: '0.92rem',
            color: '#1e293b',
            lineHeight: 2,
            whiteSpace: 'pre-wrap' as const,
            minHeight: 200,
          }}>
            {generatedEmail}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, minWidth: 140,
              padding: '0.85rem',
              borderRadius: 12,
              background: copied ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
              color: '#fff',
              fontSize: '0.9rem', fontWeight: 800,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,.35)',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}
          >
            {copied ? '✓ Copié !' : '📋 Copier la lettre'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              flex: 1, minWidth: 140,
              padding: '0.85rem',
              borderRadius: 12,
              background: '#fff',
              color: '#374151',
              fontSize: '0.9rem', fontWeight: 700,
              border: '1.5px solid #e5e7eb',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed50'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            ⬇ Télécharger .txt
          </button>
        </div>

        {/* Tips card */}
        <div style={{
          background: '#faf5ff', borderRadius: 14,
          border: '1.5px solid #e9d5ff',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
        }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            💡 Conseils pour maximiser vos chances
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              'Ajoutez votre numéro de téléphone avant l\'envoi si non mentionné.',
              'Relisez la lettre et personnalisez si nécessaire.',
              'Envoyez en format PDF ou copiez dans l\'email.',
              'Mentionnez la source de l\'offre (annonce Avito, recommandation…).',
            ].map((tip, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.83rem', color: '#6b21a8', lineHeight: 1.55 }}>
                <span style={{ flexShrink: 0, color: '#a855f7' }}>→</span> {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={restart}
            style={{
              flex: 1, minWidth: 140,
              padding: '0.75rem',
              borderRadius: 10,
              background: '#fff',
              color: '#374151',
              fontSize: '0.85rem', fontWeight: 600,
              border: '1.5px solid #e5e7eb',
              cursor: 'pointer',
            }}
          >
            🔄 Créer une nouvelle lettre
          </button>
          <Link
            href="/candidate"
            style={{
              flex: 1, minWidth: 140,
              padding: '0.75rem',
              borderRadius: 10,
              background: '#f0f2f8',
              color: '#374151',
              fontSize: '0.85rem', fontWeight: 600,
              border: '1.5px solid #e5e7eb',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ← Tableau de bord
          </Link>
        </div>
      </div>
    </Wrap>
  );
}

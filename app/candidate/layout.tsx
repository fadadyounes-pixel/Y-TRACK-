import AIAssistant from '../components/AIAssistant';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIAssistant role="candidate" context="candidate profile — CV upload, match score, job search" />
    </>
  );
}

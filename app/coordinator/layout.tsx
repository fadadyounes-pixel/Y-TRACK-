import AIAssistant from '../components/AIAssistant';

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIAssistant role="coordinator" context="coordinator workspace — job posts, candidate CVs, AI matching" />
    </>
  );
}

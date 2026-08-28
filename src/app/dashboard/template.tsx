export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-[10px] duration-500 ease-out fill-mode-both">
      {children}
    </div>
  );
}

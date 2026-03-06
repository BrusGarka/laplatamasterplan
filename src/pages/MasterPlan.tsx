/**
 * Página "Master Plan" — exibe o relatório financeiro 360° (HTML estático).
 */
export default function MasterPlan() {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <iframe
        src="/master_plan_financeiro.html"
        title="Master Plan Financeiro 360°"
        className="h-full w-full border-0"
      />
    </div>
  );
}

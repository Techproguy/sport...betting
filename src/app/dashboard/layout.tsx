import { Header } from '@/components/layout/Header';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 flex-shrink-0 overflow-y-auto rounded-lg border border-border bg-card lg:block">
          <DashboardSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

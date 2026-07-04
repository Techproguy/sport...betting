import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        <AdminSidebar />
      </aside>
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}

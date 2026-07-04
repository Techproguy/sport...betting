import { AdminTopbar } from '@/components/layout/AdminTopbar';

export function AdminPage({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <>
      <AdminTopbar title={title} />
      <div className="space-y-6 p-4 lg:p-6">
        {action && <div className="flex justify-end">{action}</div>}
        {children}
      </div>
    </>
  );
}

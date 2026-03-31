import { Metadata } from 'next';
import { OrganizacionView } from '@/components/admin/OrganizacionView';

export const metadata: Metadata = {
  title: 'Organización | Admin Boda',
  description: 'Gestión de tareas, presupuesto y proveedores',
};

export default function OrganizacionPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <OrganizacionView />
      </div>
    </div>
  );
}

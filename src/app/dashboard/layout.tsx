import { requireOwner } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner(); // penjagaan sisi server: bukan Owner aktif => keluar
  return (
    <div className="flex min-h-screen">
      <Sidebar owner={owner} />
      <main className="flex-1 overflow-x-hidden px-10 py-10">{children}</main>
    </div>
  );
}

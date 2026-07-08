import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
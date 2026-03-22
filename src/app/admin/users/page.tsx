"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle, RefreshCw, Shield, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { fetchAdminUsers, banAdminUser, type AdminUser } from "@/services/admin";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [processing, setProcessing] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAdminUsers();
        if (!cancelled) setUsers(data);
      } catch {
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const executeToggleBan = async () => {
    if (!confirmUser) return;
    setProcessing(true);
    try {
      const updated = await banAdminUser(confirmUser.id, !confirmUser.isBanned);
      setUsers((prev) => prev.map((u) => (u.id === confirmUser.id ? { ...u, isBanned: !confirmUser.isBanned } : u)));
      push({
        title: "Thao tác thành công",
        description: `Tài khoản ${confirmUser.name} đã được cập nhật trạng thái.`,
        variant: "success",
      });
      setConfirmUser(null);
    } catch (err: any) {
      push({
        title: "Thao tác thất bại",
        description: err?.message || "Lỗi hệ thống",
        variant: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const list = users.filter((u) => {
    if (!q) return true;
    const text = `${u.name} ${u.email} ${u.role}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Người dùng"
        subtitle="Quét tất cả tài khoản Client, Freelancer và Admin."
        actions={
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => {
              setLoading(true);
              fetchAdminUsers().then(setUsers).finally(() => setLoading(false));
              push({ title: "Đã làm mới", description: "Dữ liệu mới nhất được tải lại.", variant: "info" });
            }}
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
        }
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="w-full max-w-sm">
             <Input label="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên, Email, Vai trò..." className="bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div className="text-sm font-semibold text-zinc-400 mt-2 sm:mt-0">Tổng: {list.length} tài khoản</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-200 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                       <Users className="h-4 w-4 text-zinc-400" />
                    </div>
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3">
                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' :
                        u.role === 'FREELANCER' ? 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20' : 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20'
                     }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                       <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"><Ban className="h-3 w-3" /> Bị khoá</span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"><CheckCircle className="h-3 w-3" /> Hoạt động</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== "ADMIN" && (
                       <Button size="sm" variant="ghost" onClick={() => setConfirmUser(u)} className={u.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300' : 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'}>
                         {u.isBanned ? "Mở Khoá" : "Khoá TK"}
                       </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#09090B] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-zinc-100">Xác nhận thao tác</h3>
            <p className="mt-2 text-[15px] text-zinc-400 leading-relaxed">
              Bạn có chắc chắn muốn {confirmUser.isBanned ? (
                <span className="font-bold text-emerald-400">MỞ KHOÁ</span>
              ) : (
                <span className="font-bold text-rose-400">KHOÁ</span>
              )}{" "}
              tài khoản <span className="font-bold text-white">{confirmUser.name}</span>?
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirmUser(null)} disabled={processing} className="border-transparent bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                Hủy bỏ
              </Button>
              <Button 
                variant="primary" 
                className={confirmUser.isBanned ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600 hover:bg-rose-500 text-white"} 
                onClick={executeToggleBan} 
                disabled={processing}
              >
                {processing ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

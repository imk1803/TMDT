"use client";

import { useEffect, useState } from "react";
import { fetchAdminResources } from "@/services/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { File, Image as ImageIcon, Link2, ExternalLink } from "lucide-react";

export default function AdminResourcesPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminResources()
      .then((data) => setList(data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  function getIcon(type: string) {
    if (type === "IMAGE") return <ImageIcon className="h-4 w-4 text-emerald-400" />;
    if (type === "LINK") return <Link2 className="h-4 w-4 text-sky-400" />;
    return <File className="h-4 w-4 text-indigo-400" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Tài nguyên"
        subtitle="Tracking file đính kèm, hình ảnh và URL liên kết được upload trên toàn hệ thống."
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="w-full max-w-sm">
             {/* No filters for now */}
          </div>
          <div className="text-sm font-semibold text-zinc-400 mt-2 sm:mt-0">Tổng: {list.length} tệp</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Tên file / URL</th>
                <th className="px-4 py-3">Người tải lên</th>
                <th className="px-4 py-3">Kích thước</th>
                <th className="px-4 py-3">Ngày Tải</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700">
                        {getIcon(r.type)}
                     </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-200 max-w-xs truncate" title={r.fileName || r.url}>
                       {r.fileName || r.url}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5" title={`Thuộc Hợp đồng: ${r.contractId}`}>
                       Contract: {r.contractId.substring(0,8)}...
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-300">{r.uploader?.name || "N/A"}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(2)} MB` : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                     <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">
                        Mở <ExternalLink className="h-3 w-3" />
                     </a>
                  </td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Không có tài nguyên nào được tải lên hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

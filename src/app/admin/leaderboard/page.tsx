"use client";

import { useEffect, useState } from "react";
import { fetchAdminLeaderboard } from "@/services/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Trophy, Star, Target, CheckCircle } from "lucide-react";

export default function AdminLeaderboardPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLeaderboard()
      .then((data) => setList(data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Leaderboard: Top Freelancers"
        subtitle="Ranked dynamically by completed jobs, rating, and overall score."
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="w-full max-w-sm">
             {/* No filters for now, just static leaderboard */}
          </div>
          <div className="text-sm font-semibold text-zinc-400 mt-2 sm:mt-0">Hiển thị: Top {list.length}</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">Hạng</th>
                <th className="px-4 py-3">Freelancer</th>
                <th className="px-4 py-3">Chuyên môn</th>
                <th className="px-4 py-3">Hoàn thành</th>
                <th className="px-4 py-3">Thu nhập</th>
                <th className="px-4 py-3">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {list.map((profile, i) => (
                <tr key={profile.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-300">
                    {i === 0 ? <Trophy className="h-5 w-5 text-yellow-400" /> : 
                     i === 1 ? <Trophy className="h-5 w-5 text-zinc-300" /> : 
                     i === 2 ? <Trophy className="h-5 w-5 text-amber-600" /> : 
                     <span className="font-bold text-zinc-500 ml-1">#{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{profile.user?.name}</p>
                    <p className="text-xs text-zinc-500">{profile.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                     <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-widest bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                        {profile.title || "N/A"}
                     </span>
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {profile.completedJobs} jobs
                     </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-zinc-200">
                     {Number(profile.totalIncome).toLocaleString()} VNĐ
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {typeof profile.avgRating === 'number' ? profile.avgRating.toFixed(1) : "0.0"}
                     </div>
                  </td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Leaderboard trống. Chưa có freelancer nào hoạt động.
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

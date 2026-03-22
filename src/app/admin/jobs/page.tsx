'use client';

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createJob, deleteJob, fetchJobs, updateJob } from "@/services/jobs";
import type { Job } from "@/types/job";

interface JobFormState {
  id?: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  type: string;
}

const PAGE_SIZE = 5;

type JobSortField = "title" | "company" | "location" | "workMode";

export default function AdminJobsPage() {
  const [q, setQ] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Job | null>(null);
  const [viewing, setViewing] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<JobSortField>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchJobs();
        if (!cancelled) setJobs(data);
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const [form, setForm] = useState<JobFormState>({
    title: "",
    companyName: "",
    location: "",
    workMode: "Hybrid",
    type: "Toàn thời gian",
  });

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return jobs;
    return jobs.filter((job) => {
      const text = `${job.title} ${job.companyName} ${job.location} ${job.workMode} ${job.tags.join(
        " "
      )}`.toLowerCase();
      return text.includes(kw);
    });
  }, [jobs, q]);

  const sorted = useMemo(() => {
    const base = [...filtered];
    base.sort((a, b) => {
      let av: string;
      let bv: string;
      switch (sortBy) {
        case "company":
          av = a.companyName;
          bv = b.companyName;
          break;
        case "location":
          av = a.location;
          bv = b.location;
          break;
        case "workMode":
          av = a.workMode;
          bv = b.workMode;
          break;
        case "title":
        default:
          av = a.title;
          bv = b.title;
      }
      const res = av.localeCompare(bv, "vi", { sensitivity: "base" });
      return sortDir === "asc" ? res : -res;
    });
    return base;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      title: "",
      companyName: "",
      location: "",
      workMode: "Hybrid",
      type: "Toàn thời gian",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditing(job);
    setForm({
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      workMode: job.workMode,
      type: job.type,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.companyName.trim()) {
      push({
        title: "Missing required fields",
        description: "Job title and company are required.",
        variant: "error",
      });
      return;
    }

    try {
      if (editing) {
        await updateJob(editing.id, {
          title: form.title.trim(),
          description: `Updated by admin: ${form.title.trim()}`,
          budget: 0,
          location: form.location || editing.location,
          workMode: form.workMode,
          experienceLevel: "Mid",
        });
      } else {
        await createJob({
          title: form.title.trim(),
          description: `Created by admin: ${form.title.trim()}`,
          budget: 0,
          location: form.location || "Remote",
          workMode: form.workMode,
          experienceLevel: "Junior",
        });
      }
      const data = await fetchJobs();
      setJobs(data);
      setPage(1);
      push({
        title: editing ? "Job updated" : "Job created",
        description: "Saved to database.",
        variant: "success",
      });
      setIsModalOpen(false);
    } catch (err: any) {
      push({
        title: "Action failed",
        description: err?.message || "Không thể lưu dữ liệu.",
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      push({
        title: "Job deleted",
        description: "Removed from database.",
        variant: "info",
      });
    } catch (err: any) {
      push({
        title: "Delete failed",
        description: err?.message || "Không thể xoá tin.",
        variant: "error",
      });
    } finally {
      setJobToDelete(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý việc làm"
        subtitle="Tìm kiếm, quản lý danh sách tin đăng (đã kết nối API)."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => {
                setLoading(true);
                fetchJobs()
                  .then((data) => setJobs(data))
                  .finally(() => setLoading(false));
                setPage(1);
                setQ("");
                push({
                  title: "Jobs refreshed",
                  description: "Reloaded from API.",
                  variant: "info",
                });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4" />
              Thêm tin
            </Button>
          </>
        }
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 w-full max-w-md">
            <Input
              label="Tìm kiếm"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="VD: React, Hà Nội, Remote..."
              className="bg-zinc-900 border-zinc-700 text-white"
            />
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-zinc-400 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-zinc-500 sm:inline">
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as JobSortField)
                }
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
              >
                <option value="title">Theo vị trí</option>
                <option value="company">Theo công ty</option>
                <option value="location">Theo địa điểm</option>
                <option value="workMode">Theo hình thức</option>
              </select>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-white"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "A → Z" : "Z → A"}
              </Button>
            </div>
            <div>
              Tìm thấy{" "}
              <span className="font-semibold text-white">
                {loading ? 0 : sorted.length}
              </span>{" "}
              tin · Trang {currentPage}/{totalPages}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">Vị trí</th>
                <th className="hidden px-4 py-3 md:table-cell">Công ty</th>
                <th className="hidden px-4 py-3 lg:table-cell">Địa điểm</th>
                <th className="hidden px-4 py-3 lg:table-cell">Hình thức</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginated.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-200">{job.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5" />
                        {job.tags.slice(0, 3).join(", ")}
                      </span>
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-300 md:table-cell">
                    {job.companyName}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-400 lg:table-cell">
                    {job.location}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-400 lg:table-cell">
                    {job.workMode}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                       <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setViewing(job)}>
                          Xem
                       </Button>
                       <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-indigo-400" onClick={() => openEditModal(job)}>
                          Sửa
                       </Button>
                       <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400" onClick={() => setJobToDelete(job)}>
                         Xóa
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    Không có dữ liệu phù hợp với từ khóa hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 sm:text-sm">
            <span>
              Hiển thị{" "}
              <span className="font-semibold text-white">{paginated.length}</span>{" "}
              /{" "}
              <span className="font-semibold text-white">
                {filtered.length}
              </span>{" "}
              tin
            </span>
            <div className="inline-flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span className="text-xs text-slate-400">
                Trang {currentPage}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}

        {(isModalOpen || viewing) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#09090b]/80 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <p className="text-lg font-bold text-white">
                    {viewing
                      ? "Chi tiết tin tuyển dụng"
                      : editing
                      ? "Chỉnh sửa tin tuyển dụng"
                      : "Thêm tin tuyển dụng"}
                  </p>
                  {!viewing && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Dữ liệu chỉ được lưu trong bộ nhớ trình duyệt (demo).
                    </p>
                  )}
                </div>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                  onClick={() => {
                    setIsModalOpen(false);
                    setViewing(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {viewing ? (
                <div className="space-y-3 text-sm text-zinc-300">
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                      Vị trí
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {viewing.title}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Công ty
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-300">
                        {viewing.companyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Địa điểm
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-300">
                        {viewing.location}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Hình thức làm việc
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-300">
                        {viewing.workMode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Loại công việc
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-300">
                        {viewing.type}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                      Kỹ năng/Từ khoá
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-300">
                      {viewing.tags.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                      Mô tả
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-zinc-300">
                      {viewing.description}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <Input
                      label="Tiêu đề"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                    <Input
                      label="Công ty"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, companyName: e.target.value }))
                      }
                    />
                    <Input
                      label="Địa điểm"
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      placeholder="VD: Hà Nội, TP. HCM..."
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-800">
                          Hình thức làm việc
                        </label>
                        <select
                          value={form.workMode}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, workMode: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        >
                          <option value="Onsite">Onsite</option>
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-800">
                          Loại công việc
                        </label>
                        <select
                          value={form.type}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, type: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        >
                          <option value="Toàn thời gian">Toàn thời gian</option>
                          <option value="Bán thời gian">Bán thời gian</option>
                          <option value="Thực tập">Thực tập</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                      className="text-slate-700 hover:bg-slate-100"
                    >
                      Huỷ
                    </Button>
                    <Button onClick={handleSave}>
                      {editing ? "Lưu thay đổi" : "Tạo tin"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {jobToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#09090b]/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-center">
             <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
               <X className="h-6 w-6" />
             </div>
             <h3 className="text-lg font-bold text-white mb-2">Xác nhận xoá</h3>
             <p className="text-sm text-zinc-400 mb-6">
                Bạn có chắc chắn muốn xoá tin tuyển dụng <br/><strong className="text-zinc-200">{jobToDelete.title}</strong>? Hành động này không thể hoàn tác.
             </p>
             <div className="flex justify-center gap-3">
               <Button
                 variant="ghost"
                 onClick={() => setJobToDelete(null)}
                 className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
               >
                 Huỷ bỏ
               </Button>
               <Button 
                 onClick={confirmDelete}
                 className="bg-rose-600 hover:bg-rose-700 text-white border border-rose-500"
               >
                 Xoá tin
               </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}






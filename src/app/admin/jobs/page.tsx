'use client';

import { useMemo, useState } from "react";
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { jobs as seedJobs } from "@/data/jobs";
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
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Job | null>(null);
  const [viewing, setViewing] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<JobSortField>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  const handleSave = () => {
    if (!form.title.trim() || !form.companyName.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và tên công ty.");
      return;
    }

    if (editing) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === editing.id
            ? {
                ...job,
                title: form.title.trim(),
                companyName: form.companyName.trim(),
                location: form.location || job.location,
                workMode: form.workMode as Job["workMode"],
                type: form.type as Job["type"],
              }
            : job
        )
      );
    } else {
      const newJob: Job = {
        id: String(Date.now()),
        title: form.title.trim(),
        companyId: "demo",
        companyName: form.companyName.trim(),
        location: form.location || "TP. Hồ Chí Minh",
        salary: "Thoả thuận",
        type: form.type as Job["type"],
        workMode: form.workMode as Job["workMode"],
        experienceLevel: "Junior",
        tags: ["Demo"],
        description: "Tin tuyển dụng demo được tạo từ trang Admin.",
      };
      setJobs((prev) => [newJob, ...prev]);
      setPage(1);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (job: Job) => {
    if (!confirm(`Xoá tin tuyển dụng "${job.title}"?`)) return;
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý việc làm"
        subtitle="Tìm kiếm, quản lý danh sách tin đăng (demo – CRUD phía client, chưa lưu DB)."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => {
                setJobs(seedJobs);
                setPage(1);
                setQ("");
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

      <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <Input
              label="Tìm kiếm"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="VD: React, Hà Nội, Remote..."
            />
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-slate-500 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-slate-500 sm:inline">
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as JobSortField)
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
              >
                <option value="title">Theo vị trí</option>
                <option value="company">Theo công ty</option>
                <option value="location">Theo địa điểm</option>
                <option value="workMode">Theo hình thức</option>
              </select>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-slate-600 hover:bg-slate-100"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "A → Z" : "Z → A"}
              </Button>
            </div>
            <div>
              Tìm thấy{" "}
              <span className="font-semibold text-slate-900">
                {sorted.length}
              </span>{" "}
              tin · Trang {currentPage}/{totalPages}
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Vị trí</th>
                <th className="hidden px-4 py-3 md:table-cell">Công ty</th>
                <th className="hidden px-4 py-3 lg:table-cell">Địa điểm</th>
                <th className="hidden px-4 py-3 lg:table-cell">Hình thức</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((job) => (
                <tr key={job.id} className="bg-white hover:bg-sky-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Search className="h-3.5 w-3.5" />
                        {job.tags.slice(0, 3).join(", ")}
                      </span>
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-700 md:table-cell">
                    {job.companyName}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-700 lg:table-cell">
                    {job.location}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-700 lg:table-cell">
                    {job.workMode}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-600 hover:bg-sky-50"
                        onClick={() => setViewing(job)}
                      >
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditModal(job)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => handleDelete(job)}
                      >
                        Xoá
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-300"
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
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-200">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {viewing
                      ? "Chi tiết tin tuyển dụng"
                      : editing
                      ? "Chỉnh sửa tin tuyển dụng"
                      : "Thêm tin tuyển dụng"}
                  </p>
                  {!viewing && (
                    <p className="text-xs text-slate-500">
                      Dữ liệu chỉ được lưu trong bộ nhớ trình duyệt (demo).
                    </p>
                  )}
                </div>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
                  onClick={() => {
                    setIsModalOpen(false);
                    setViewing(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {viewing ? (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Vị trí
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {viewing.title}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Công ty
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.companyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Địa điểm
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.location}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Hình thức làm việc
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.workMode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Loại công việc
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.type}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Kỹ năng/Từ khoá
                    </p>
                    <p className="mt-0.5 text-sm text-slate-800">
                      {viewing.tags.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Mô tả
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-slate-800">
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
    </div>
  );
}


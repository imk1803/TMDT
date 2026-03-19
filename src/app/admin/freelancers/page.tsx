"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trophy, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { getEligibleRanked } from "@/lib/ranking";
import type { Freelancer, FreelancerCategory } from "@/types/freelancer";
import {
  adminCreateFreelancer,
  adminDeleteFreelancer,
  adminFetchFreelancers,
  adminUpdateFreelancer,
} from "@/services/admin.freelancers";

interface FreelancerFormState {
  id?: string;
  name: string;
  email: string;
  password: string;
  category: FreelancerCategory;
  completedJobs: string;
  totalIncome: string;
  rating: string;
  onTimeRate: string;
}

type FreelancerSortField = "rank" | "name" | "rating" | "income" | "jobs";

export default function AdminFreelancersPage() {
  const [q, setQ] = useState("");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Freelancer | null>(null);
  const [viewing, setViewing] = useState<Freelancer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<FreelancerSortField>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { push } = useToast();

  const [form, setForm] = useState<FreelancerFormState>({
    name: "",
    email: "",
    password: "",
    category: "IT",
    completedJobs: "",
    totalIncome: "",
    rating: "",
    onTimeRate: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await adminFetchFreelancers();
        if (!cancelled) setFreelancers(data);
      } catch {
        if (!cancelled) setFreelancers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const ranked = useMemo(() => getEligibleRanked(freelancers), [freelancers]);

  const rankedById = useMemo(() => {
    const map = new Map<string, Freelancer>();
    ranked.forEach((f) => map.set(f.id, f));
    return map;
  }, [ranked]);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const base = freelancers.filter((f) => {
      if (!kw) return true;
      const text = `${f.name} ${f.category} ${f.rating} ${f.onTimeRate}`.toLowerCase();
      return text.includes(kw);
    });

    const sorted = [...base].sort((a, b) => {
      const ra = rankedById.get(a.id);
      const rb = rankedById.get(b.id);

      let av: number | string | undefined;
      let bv: number | string | undefined;

      switch (sortBy) {
        case "name":
          av = a.name;
          bv = b.name;
          break;
        case "rating":
          av = a.rating;
          bv = b.rating;
          break;
        case "income":
          av = a.totalIncome;
          bv = b.totalIncome;
          break;
        case "jobs":
          av = a.completedJobs;
          bv = b.completedJobs;
          break;
        case "rank":
        default:
          av = ra?.currentRank ?? Number.POSITIVE_INFINITY;
          bv = rb?.currentRank ?? Number.POSITIVE_INFINITY;
          break;
      }

      let res: number;
      if (typeof av === "string" || typeof bv === "string") {
        res = String(av ?? "").localeCompare(String(bv ?? ""), "vi", {
          sensitivity: "base",
        });
      } else {
        const na = (av as number) ?? 0;
        const nb = (bv as number) ?? 0;
        res = na === nb ? 0 : na < nb ? -1 : 1;
      }

      return sortDir === "asc" ? res : -res;
    });

    return sorted;
  }, [freelancers, q, rankedById, sortBy, sortDir]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      password: "",
      category: "IT",
      completedJobs: "",
      totalIncome: "",
      rating: "",
      onTimeRate: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f: Freelancer) => {
    setEditing(f);
    setForm({
      id: f.id,
      name: f.name,
      email: "",
      password: "",
      category: f.category,
      completedJobs: String(f.completedJobs),
      totalIncome: String(f.totalIncome),
      rating: String(f.rating),
      onTimeRate: String(f.onTimeRate),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      push({
        title: "Missing required fields",
        description: "Freelancer name is required.",
        variant: "error",
      });
      return;
    }
    if (!editing) {
      if (!form.email.trim()) {
        push({
          title: "Missing required fields",
          description: "Email là bắt buộc khi tạo freelancer.",
          variant: "error",
        });
        return;
      }
      if (form.password.trim().length < 6) {
        push({
          title: "Mật khẩu chưa hợp lệ",
          description: "Mật khẩu phải có ít nhất 6 ký tự.",
          variant: "error",
        });
        return;
      }
    }

    const completedJobs = Number.parseInt(form.completedJobs || "0", 10);
    const totalIncome = Number.parseInt(form.totalIncome || "0", 10);
    const rating = Number.parseFloat(form.rating || "0");
    const onTimeRate = Number.parseFloat(form.onTimeRate || "0");

    const normalized: Freelancer = {
      id: form.id ?? String(Date.now()),
      name: form.name.trim(),
      avatar: "https://i.pravatar.cc/150?img=1",
      category: form.category,
      completedJobs: Number.isFinite(completedJobs) ? completedJobs : 0,
      totalIncome: Number.isFinite(totalIncome) ? totalIncome : 0,
      rating: Number.isFinite(rating) ? rating : 0,
      onTimeRate: Number.isFinite(onTimeRate) ? onTimeRate : 0,
    };

    try {
      if (editing) {
        await adminUpdateFreelancer(editing.id, {
          name: normalized.name,
          title: normalized.category,
          completedJobs: normalized.completedJobs,
          totalIncome: normalized.totalIncome,
          rating: normalized.rating,
          onTimeRate: normalized.onTimeRate,
        });
      } else {
        await adminCreateFreelancer({
          name: normalized.name,
          email: form.email.trim(),
          password: form.password.trim(),
          title: normalized.category,
          completedJobs: normalized.completedJobs,
          totalIncome: normalized.totalIncome,
          rating: normalized.rating,
          onTimeRate: normalized.onTimeRate,
        });
      }

      const data = await adminFetchFreelancers();
      setFreelancers(data);
      push({
        title: editing ? "Freelancer updated" : "Freelancer created",
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

  const handleDelete = async (f: Freelancer) => {
    if (!confirm(`Xoá freelancer "${f.name}"?`)) return;
    try {
      await adminDeleteFreelancer(f.id);
      setFreelancers((prev) => prev.filter((x) => x.id !== f.id));
      push({
        title: "Freelancer deleted",
        description: "Removed from database.",
        variant: "info",
      });
    } catch (err: any) {
      push({
        title: "Delete failed",
        description: err?.message || "Không thể xoá freelancer.",
        variant: "error",
      });
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý xếp hạng freelancer"
        subtitle="Danh sách đủ điều kiện theo tiêu chí quý (đã kết nối API)."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => {
                setLoading(true);
                adminFetchFreelancers()
                  .then((data) => setFreelancers(data))
                  .finally(() => setLoading(false));
                setQ("");
                push({
                  title: "Freelancers refreshed",
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
              Thêm freelancer
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
              onChange={(e) => setQ(e.target.value)}
              placeholder="VD: IT, 4.9, Nguyễn..."
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
                  setSortBy(e.target.value as FreelancerSortField)
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
              >
                <option value="rank">Theo thứ hạng</option>
                <option value="name">Theo tên</option>
                <option value="rating">Theo rating</option>
                <option value="income">Theo thu nhập</option>
                <option value="jobs">Theo số job</option>
              </select>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-slate-600 hover:bg-slate-100"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </Button>
            </div>
            <div>
              Đủ điều kiện:{" "}
              <span className="font-semibold text-slate-900">
                {loading ? 0 : ranked.length}
              </span>
              {" · "}
              Tổng hiển thị:{" "}
              <span className="font-semibold text-slate-900">
                {loading ? 0 : list.length}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Hạng</th>
                <th className="px-4 py-3">Freelancer</th>
                <th className="hidden px-4 py-3 md:table-cell">Ngành</th>
                <th className="hidden px-4 py-3 lg:table-cell">Rating</th>
                <th className="hidden px-4 py-3 lg:table-cell">Đúng hạn</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && list.map((f) => {
                const rankedItem = rankedById.get(f.id);
                return (
                  <tr key={f.id} className="bg-white hover:bg-sky-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500/10 to-teal-500/10 ring-1 ring-sky-100">
                          <Trophy className="h-4 w-4 text-sky-600" />
                        </span>
                        {rankedItem?.currentRank ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{f.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Jobs {f.completedJobs} · Thu nhập {Math.round(f.totalIncome / 1_000_000)}m
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 md:table-cell">
                      {f.category}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 lg:table-cell">
                      {f.rating}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 lg:table-cell">
                      {f.onTimeRate}%
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-sky-700">
                      {rankedItem?.rankingScore?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-700 hover:bg-slate-100"
                          onClick={() => setViewing(f)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-700 hover:bg-slate-100"
                          onClick={() => openEditModal(f)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => handleDelete(f)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && list.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Không có dữ liệu phù hợp với từ khoá hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(isModalOpen || viewing) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-200">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {viewing
                      ? "Chi tiết freelancer"
                      : editing
                      ? "Chỉnh sửa freelancer"
                      : "Thêm freelancer mới"}
                  </p>
                  {!viewing && (
                    <p className="text-xs text-slate-500">
                      Dữ liệu được lưu vào database (chỉ sửa được khi đã có freelancer).
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
                      Họ và tên
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {viewing.name}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Ngành
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Số job đã hoàn thành
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.completedJobs}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Tổng thu nhập (VNĐ)
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.totalIncome.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Rating / Đúng hạn
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.rating} ★ · {viewing.onTimeRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <Input
                      label="Họ và tên"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                    {!editing && (
                      <>
                        <Input
                          label="Email"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                          placeholder="VD: freelancer@gmail.com"
                        />
                        <Input
                          label="Mật khẩu"
                          type="password"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, password: e.target.value }))
                          }
                          placeholder="Tối thiểu 6 ký tự"
                        />
                      </>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-800">
                          Ngành
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              category: e.target.value as FreelancerCategory,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        >
                          <option value="IT">IT</option>
                          <option value="Kế toán">Kế toán</option>
                          <option value="Thiết kế">Thiết kế</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Viết nội dung">Viết nội dung</option>
                        </select>
                      </div>

                      <Input
                        label="Số job đã hoàn thành"
                        value={form.completedJobs}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            completedJobs: e.target.value,
                          }))
                        }
                        placeholder="VD: 60"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Tổng thu nhập (VNĐ)"
                        value={form.totalIncome}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            totalIncome: e.target.value,
                          }))
                        }
                        placeholder="VD: 80000000"
                      />
                      <Input
                        label="Rating (0-5)"
                        value={form.rating}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            rating: e.target.value,
                          }))
                        }
                        placeholder="VD: 4.8"
                      />
                    </div>

                    <Input
                      label="Tỉ lệ đúng hạn (%)"
                      value={form.onTimeRate}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          onTimeRate: e.target.value,
                        }))
                      }
                      placeholder="VD: 95"
                    />
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
                      {editing ? "Lưu thay đổi" : "Thêm freelancer"}
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

'use client';

import { useMemo, useState } from "react";
import { Building2, Plus, RefreshCw, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { companies as seedCompanies } from "@/data/companies";
import type { Company } from "@/types/company";

interface CompanyFormState {
  id?: string;
  name: string;
  location: string;
  industry: string;
  employees: string;
  jobsOpen: string;
  tagline: string;
  logoText: string;
}

export default function AdminCompaniesPage() {
  const [q, setQ] = useState("");
  const [companies, setCompanies] = useState<Company[]>(seedCompanies);
  const [editing, setEditing] = useState<Company | null>(null);
  const [viewing, setViewing] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<CompanyFormState>({
    name: "",
    location: "",
    industry: "",
    employees: "",
    jobsOpen: "",
    tagline: "",
    logoText: "",
  });

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return companies;
    return companies.filter((c) => {
      const text = `${c.name} ${c.location} ${c.industry} ${c.tagline}`.toLowerCase();
      return text.includes(kw);
    });
  }, [companies, q]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      name: "",
      location: "",
      industry: "",
      employees: "",
      jobsOpen: "",
      tagline: "",
      logoText: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditing(company);
    setForm({
      id: company.id,
      name: company.name,
      location: company.location,
      industry: company.industry,
      employees: company.employees,
      jobsOpen: String(company.jobsOpen),
      tagline: company.tagline,
      logoText: company.logoText,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.location.trim()) {
      alert("Vui lòng nhập ít nhất Tên công ty và Địa điểm.");
      return;
    }

    const jobsOpen = Number.parseInt(form.jobsOpen || "0", 10);
    const normalized: Company = {
      id: form.id ?? String(Date.now()),
      name: form.name.trim(),
      location: form.location.trim(),
      industry: form.industry.trim() || "Khác",
      employees: form.employees.trim() || "Không rõ",
      jobsOpen: Number.isFinite(jobsOpen) ? jobsOpen : 0,
      tagline: form.tagline.trim() || "Chưa có mô tả.",
      logoText:
        form.logoText.trim() ||
        form.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 3)
          .toUpperCase(),
    };

    if (editing) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === editing.id ? normalized : c))
      );
    } else {
      setCompanies((prev) => [normalized, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (company: Company) => {
    if (!confirm(`Xoá công ty "${company.name}"?`)) return;
    setCompanies((prev) => prev.filter((c) => c.id !== company.id));
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý công ty"
        subtitle="Danh sách công ty nổi bật. (Demo – CRUD phía client, chưa lưu DB)."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => {
                setCompanies(seedCompanies);
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
              Thêm công ty
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
              placeholder="VD: VietTech, Hà Nội, Fintech..."
            />
          </div>
          <div className="text-xs text-slate-500 sm:text-sm">
            Tổng{" "}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>{" "}
            công ty
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {company.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {company.industry} · {company.location}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500/10 to-teal-500/10 text-sky-700 ring-1 ring-sky-100">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                {company.tagline}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">{company.jobsOpen}</span>{" "}
                  vị trí đang tuyển
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-700 hover:bg-slate-100"
                    onClick={() => setViewing(company)}
                  >
                    Xem
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditModal(company)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => handleDelete(company)}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              Không có dữ liệu phù hợp với từ khóa hiện tại.
            </div>
          )}
        </div>

        {(isModalOpen || viewing) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-200">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {viewing
                      ? "Chi tiết công ty"
                      : editing
                      ? "Chỉnh sửa công ty"
                      : "Thêm công ty mới"}
                  </p>
                  {!viewing && (
                    <p className="text-xs text-slate-500">
                      Dữ liệu chỉ được lưu trong phiên trình duyệt (demo).
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
                      Tên công ty
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {viewing.name}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Địa điểm
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Ngành
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.industry}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Quy mô nhân sự
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.employees}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Vị trí đang tuyển
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">
                        {viewing.jobsOpen}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Tagline
                    </p>
                    <p className="mt-0.5 text-sm text-slate-800">
                      {viewing.tagline}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <Input
                      label="Tên công ty"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
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
                    <Input
                      label="Ngành"
                      value={form.industry}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, industry: e.target.value }))
                      }
                      placeholder="VD: Công nghệ, Fintech..."
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Quy mô nhân sự"
                        value={form.employees}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            employees: e.target.value,
                          }))
                        }
                        placeholder="VD: 50-100"
                      />
                      <Input
                        label="Số vị trí đang tuyển"
                        value={form.jobsOpen}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, jobsOpen: e.target.value }))
                        }
                        placeholder="VD: 5"
                      />
                    </div>
                    <Input
                      label="Logo text (tối đa 3 ký tự)"
                      value={form.logoText}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, logoText: e.target.value }))
                      }
                      placeholder="VD: VS, FX..."
                    />
                    <Input
                      label="Tagline"
                      value={form.tagline}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, tagline: e.target.value }))
                      }
                      placeholder="Mô tả ngắn gọn về công ty..."
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
                      {editing ? "Lưu thay đổi" : "Thêm công ty"}
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


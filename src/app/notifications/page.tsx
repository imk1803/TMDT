"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";
import {
  AppNotification,
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resolveNotificationHref,
} from "@/services/notifications";

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

function emitUnreadCount(unreadCount: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("notifications:updated", {
      detail: { unreadCount },
    })
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(() => items.filter((n) => !n.readAt).length, [items]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user?.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.role === "ADMIN") return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchMyNotifications();
        if (!cancelled) {
          const nextItems = res.notifications || [];
          setItems(nextItems);
          emitUnreadCount(nextItems.filter((n) => !n.readAt).length);
        }
      } catch (err: any) {
        if (!cancelled) {
          setItems([]);
          push({
            title: "Không tải được thông báo",
            description: err?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, push]);

  if (loading || loadingData) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải thông báo...
          </div>
        </Container>
      </div>
    );
  }

  if (!user || user.role === "ADMIN") return null;

  async function handleMarkAll() {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => {
        const next = prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }));
        emitUnreadCount(0);
        return next;
      });
      push({
        title: "Đã đánh dấu đã đọc",
        description: "Tất cả thông báo đã được cập nhật.",
        variant: "success",
      });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkOne(id: string) {
    try {
      await markNotificationRead(id);
      setItems((prev) => {
        const next = prev.map((n) =>
          n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
        );
        emitUnreadCount(next.filter((n) => !n.readAt).length);
        return next;
      });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    }
  }

  async function handleOpenNotification(item: AppNotification) {
    if (!item.readAt) {
      try {
        await markNotificationRead(item.id);
      } catch {
        // keep navigation flow even if mark-read fails
      }

      setItems((prev) => {
        const next = prev.map((n) =>
          n.id === item.id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
        );
        emitUnreadCount(next.filter((n) => !n.readAt).length);
        return next;
      });
    }

    const href = resolveNotificationHref(item);

    if (user?.role === "FREELANCER" && href.startsWith("/jobs/")) {
      const jobId = href.split("/")[2];
      if (jobId) {
        try {
          const data = await apiFetch<{ job?: { status?: string } }>(`/api/jobs/${jobId}`);
          if (data?.job?.status && data.job.status !== "OPEN") {
            push({
              title: "Không thể truy cập công việc",
              description: "Công việc đã ở trạng thái đang thực hiện, bạn không thể mở từ thông báo này.",
              variant: "info",
            });
            return;
          }
        } catch {
          push({
            title: "Không thể mở thông báo",
            description: "Không kiểm tra được trạng thái công việc.",
            variant: "error",
          });
          return;
        }
      }
    }

    router.push(href);
  }

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Thông báo</h1>
                <p className="text-sm text-slate-500">
                  Bạn có <span className="font-semibold text-slate-800">{unreadCount}</span> thông báo chưa đọc.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMarkAll}
              disabled={markingAll || unreadCount === 0}
              className="gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              <span>{markingAll ? "Đang cập nhật..." : "Đánh dấu đã đọc tất cả"}</span>
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenNotification(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void handleOpenNotification(item);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`w-full rounded-2xl border p-4 text-left transition-colors hover:border-sky-200 hover:bg-sky-50 ${
                  item.readAt
                    ? "border-slate-200 bg-slate-50/60"
                    : "border-sky-200 bg-sky-50/70"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatTime(item.createdAt)}</p>
                  </div>
                  {!item.readAt && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleMarkOne(item.id);
                      }}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Hiện chưa có thông báo nào.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

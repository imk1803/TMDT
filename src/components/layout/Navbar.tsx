"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Briefcase, ChevronDown, LogIn, Menu, PlusCircle, UserCircle, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";
import {
  AppNotification,
  fetchMyNotifications,
  getNotificationsStreamUrl,
  markNotificationRead,
  resolveNotificationHref,
} from "@/services/notifications";
import { fetchMyWallet } from "@/services/wallet";

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);

  const { user, logout } = useAuth();
  const { push } = useToast();
  const [mounted, setMounted] = useState(false);

  const canShowNotifications = mounted && !!user && user.role !== "ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setNotificationMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const applyNotifications = useCallback((items: AppNotification[]) => {
    setRecentNotifications(items.slice(0, 5));
    setUnreadCount(items.filter((n) => !n.readAt).length);
  }, []);

  const loadWallet = useCallback(async () => {
    if (!user || user.role === "ADMIN") {
      setWalletBalance(0);
      return;
    }
    try {
      const res = await fetchMyWallet();
      setWalletBalance(Number(res.wallet?.availableBalance ?? 0));
    } catch {
      // silent in navbar
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user || user.role === "ADMIN") {
      setUnreadCount(0);
      setRecentNotifications([]);
      return;
    }
    try {
      const res = await fetchMyNotifications();
      applyNotifications(res.notifications || []);
    } catch {
      // silent in navbar background refresh
    }
  }, [applyNotifications, user]);

  useEffect(() => {
    if (!canShowNotifications) {
      setUnreadCount(0);
      setRecentNotifications([]);
      return;
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 20000);

    const streamUrl = getNotificationsStreamUrl();
    const es = streamUrl ? new EventSource(streamUrl) : null;
    const onUnreadCount = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data || "{}");
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
          if (notificationMenuOpen) loadNotifications();
        }
      } catch {
        // ignore invalid stream payload
      }
    };
    es?.addEventListener("unread_count", onUnreadCount as EventListener);

    const onVisible = () => {
      if (document.visibilityState === "visible") loadNotifications();
    };
    const onFocus = () => loadNotifications();
    const onNotificationsUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ unreadCount?: number }>;
      if (typeof custom.detail?.unreadCount === "number") {
        setUnreadCount(custom.detail.unreadCount);
      }
      loadNotifications();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("notifications:updated", onNotificationsUpdated as EventListener);

    return () => {
      window.clearInterval(intervalId);
      es?.removeEventListener("unread_count", onUnreadCount as EventListener);
      es?.close();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("notifications:updated", onNotificationsUpdated as EventListener);
    };
  }, [canShowNotifications, loadNotifications, notificationMenuOpen]);

  useEffect(() => {
    if (!mounted || !user || user.role === "ADMIN") {
      setWalletBalance(0);
      return;
    }
    loadWallet();
  }, [loadWallet, mounted, user]);

  useEffect(() => {
    if (!mounted || !user || user.role === "ADMIN") return;

    const onWalletUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ availableBalance?: number }>;
      if (typeof custom.detail?.availableBalance === "number") {
        setWalletBalance(custom.detail.availableBalance);
        return;
      }
      loadWallet();
    };

    window.addEventListener("wallet:updated", onWalletUpdated as EventListener);
    return () => {
      window.removeEventListener("wallet:updated", onWalletUpdated as EventListener);
    };
  }, [loadWallet, mounted, user]);

  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/jobs", label: "Tìm việc" },
    { href: "/ranking", label: "Xếp hạng" },
    { href: "/companies", label: "Công ty", disabled: true },
    { href: "/about", label: "Giới thiệu", disabled: true },
    ...(mounted && user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" as const }] : []),
  ];

  const userMenuItems =
    user?.role === "CLIENT"
      ? [
          { href: "/notifications", label: "Thông báo" },
          { href: "/profile", label: "Hồ sơ" },
          { href: "/wallet", label: "Ví của tôi" },
          { href: "/contracts", label: "Hợp đồng đang thực hiện" },
          { href: "/jobs/my", label: "Tin tuyển dụng của tôi" },
        ]
      : user?.role === "FREELANCER"
      ? [
          { href: "/notifications", label: "Thông báo" },
          { href: "/profile", label: "Hồ sơ" },
          { href: "/wallet", label: "Ví của tôi" },
          { href: "/contracts", label: "Hợp đồng đang thực hiện" },
          { href: "/proposals/my", label: "Đề xuất của tôi" },
        ]
      : user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Trang quản trị" }]
      : [];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/jobs" && pathname.startsWith("/jobs/my")) return false;
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  };

  const unreadLabel = useMemo(() => {
    if (unreadCount <= 0) return "Không có thông báo mới";
    if (unreadCount === 1) return "1 thông báo chưa đọc";
    return `${unreadCount} thông báo chưa đọc`;
  }, [unreadCount]);

  async function handleNotificationClick(item: AppNotification) {
    const href = resolveNotificationHref(item);

    if (!item.readAt) {
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationRead(item.id);
      } catch {
        // silent for navbar quick action
      }
    }

    if (user?.role === "FREELANCER" && href.startsWith("/jobs/")) {
      const jobId = href.split("/")[2];
      if (jobId) {
        try {
          const data = await apiFetch<{ job?: { status?: string } }>(`/api/jobs/${jobId}`);
          if (data?.job?.status && data.job.status !== "OPEN") {
            setNotificationMenuOpen(false);
            push({
              title: "Không thể truy cập công việc",
              description: "Công việc đã ở trạng thái đang thực hiện, bạn không thể mở từ thông báo này.",
              variant: "info",
            });
            return;
          }
        } catch {
          setNotificationMenuOpen(false);
          push({
            title: "Không thể mở thông báo",
            description: "Không kiểm tra được trạng thái công việc.",
            variant: "error",
          });
          return;
        }
      }
    }

    setNotificationMenuOpen(false);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white shadow-lg shadow-sky-100">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">JobFinder</span>
            <span className="text-[11px] font-medium text-sky-500">Nền tảng tuyển dụng hiện đại</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "relative transition-colors hover:text-sky-600",
                item.disabled && "cursor-not-allowed opacity-60",
                isActive(item.href) && "text-sky-600"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {mounted && user ? (
            <div className="flex items-center gap-2.5">
              {canShowNotifications && (
                <div className="relative" ref={notificationMenuRef}>
                  <button
                    type="button"
                    onClick={async () => {
                      const next = !notificationMenuOpen;
                      setNotificationMenuOpen(next);
                      setUserMenuOpen(false);
                      if (next) {
                        setNotificationsLoading(true);
                        await loadNotifications();
                        setNotificationsLoading(false);
                      }
                    }}
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
                    aria-label="Thông báo"
                  >
                    <Bell className="h-4 w-4 text-sky-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-96 max-w-[90vw] rounded-2xl border border-sky-100 bg-white p-2 shadow-lg shadow-sky-100">
                      <div className="px-2 py-2">
                        <p className="text-sm font-semibold text-slate-900">Thông báo</p>
                        <p className="text-xs text-slate-500">{unreadLabel}</p>
                      </div>

                      <div className="max-h-80 overflow-y-auto px-1 pb-1">
                        {notificationsLoading && (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
                            Đang tải thông báo...
                          </div>
                        )}

                        {!notificationsLoading &&
                          recentNotifications.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNotificationClick(item)}
                              className={cn(
                                "mb-1 block w-full rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-sky-50",
                                item.readAt ? "border-slate-100 bg-white" : "border-sky-200 bg-sky-50/60"
                              )}
                            >
                              <p className="text-sm font-medium text-slate-900">{item.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{item.body}</p>
                              <p className="mt-1 text-[11px] text-slate-500">{formatTime(item.createdAt)}</p>
                            </button>
                          ))}

                        {!notificationsLoading && recentNotifications.length === 0 && (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
                            Hiện chưa có thông báo nào.
                          </div>
                        )}
                      </div>

                      <Link
                        href="/notifications"
                        onClick={() => setNotificationMenuOpen(false)}
                        className="mt-1 block rounded-xl px-3 py-2 text-center text-sm font-semibold text-sky-700 hover:bg-sky-50"
                      >
                        Tất cả thông báo
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((v) => {
                      const next = !v;
                      if (next) loadWallet();
                      return next;
                    });
                    setNotificationMenuOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50"
                >
                  <UserCircle className="h-4 w-4 text-sky-600" />
                  <span>{user.name || user.email}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-sky-100 bg-white p-2 shadow-lg shadow-sky-100">
                    {user.role !== "ADMIN" && (
                      <div className="mb-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2">
                        <p className="text-xs text-slate-600">Số dư tài khoản</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{walletBalance.toLocaleString("vi-VN")}đ</p>
                          <Link
                            href="/wallet/topup"
                            onClick={() => setUserMenuOpen(false)}
                            className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-sky-700"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Nạp</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {userMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-sky-50"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logout();
                      }}
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-700 shadow-sm hover:bg-sky-50 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="border-b border-sky-100 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-sky-50",
                  item.disabled && "cursor-not-allowed opacity-60",
                  isActive(item.href) && "text-sky-600"
                )}
                onClick={() => !item.disabled && setOpen(false)}
              >
                <span>{item.label}</span>
                {isActive(item.href) && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
              </Link>
            ))}

            <div className="mt-1 border-t border-sky-50 pt-2">
              {mounted && user ? (
                <>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                    onClick={async () => {
                      await logout();
                      setOpen(false);
                    }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="secondary" size="sm" fullWidth className="gap-1.5" onClick={() => setOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      <span>Đăng nhập</span>
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button size="sm" fullWidth className="gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      <span>Đăng ký</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

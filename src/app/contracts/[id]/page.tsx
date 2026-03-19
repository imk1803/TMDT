"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMyContracts } from "@/services/contracts";
import { ensureChatServerReady, getChatSocket } from "@/services/chat";
import { useToast } from "@/components/ui/Toast";

interface ContractDetail {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  price: number | string;
  status: string;
  startedAt?: string;
  completedAt?: string | null;
  dueAt?: string | null;
  job?: {
    id: string;
    title?: string | null;
    description?: string | null;
    deadlineAt?: string | null;
  } | null;
  freelancer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  client?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    clientProfile?: {
      companyLogoUrl?: string | null;
      companyName?: string | null;
    } | null;
  } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  readAt?: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name?: string | null;
  } | null;
}

export default function ContractDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const contractId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!contractId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchMyContracts();
        const found = res.contracts?.find((c: any) => c.id === contractId) || null;
        if (!cancelled) setContract(found);
      } catch {
        if (!cancelled) setContract(null);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [contractId]);

  useEffect(() => {
    const activeContractId = contract?.id;
    if (!user || !activeContractId) return;
    const currentUserId = user.id;
    let active = true;
    let mounted = true;

    async function setupRealtime() {
      await ensureChatServerReady();
      if (!mounted) return;
      const socket = getChatSocket();

      const onConnect = () => {
        if (!active) return;
        setChatConnected(true);
        socket.emit("chat:join", { contractId: activeContractId }, (res: any) => {
          if (!active) return;
          if (res?.ok) {
            setMessages((res.messages || []) as ChatMessage[]);
            const onlineUserIds = (res.onlineUserIds || []) as string[];
            setPartnerOnline(
              onlineUserIds.some((id) => id && id !== currentUserId)
            );
            socket.emit("chat:read", { contractId: activeContractId });
          } else {
            push({
              title: "Không thể tải đoạn chat",
              description: res?.error || "Vui lòng thử lại.",
              variant: "error",
            });
          }
        });
      };

      const onDisconnect = () => {
        if (!active) return;
        setChatConnected(false);
      };

      const onNewMessage = (message: ChatMessage) => {
        if (!active) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        if (message.senderId !== currentUserId) {
          socket.emit("chat:read", { contractId: activeContractId });
        }
      };

      const onTyping = (payload: { contractId?: string; userId?: string; isTyping?: boolean }) => {
        if (!active) return;
        if (payload?.contractId !== activeContractId) return;
        if (!payload?.userId || payload.userId === currentUserId) return;
        setPartnerTyping(Boolean(payload.isTyping));
      };

      const onRead = (payload: { contractId?: string; readerId?: string; messageIds?: string[]; readAt?: string }) => {
        if (!active) return;
        if (payload?.contractId !== activeContractId) return;
        if (!payload?.readerId || payload.readerId === currentUserId) return;
        const ids = new Set(payload.messageIds || []);
        if (ids.size === 0) return;
        setMessages((prev) =>
          prev.map((m) =>
            ids.has(m.id) ? { ...m, readAt: payload.readAt || new Date().toISOString() } : m
          )
        );
      };

      const onPresence = (payload: { contractId?: string; onlineUserIds?: string[] }) => {
        if (!active) return;
        if (payload?.contractId !== activeContractId) return;
        const ids = payload.onlineUserIds || [];
        setPartnerOnline(ids.some((id) => id && id !== currentUserId));
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("chat:new", onNewMessage);
      socket.on("chat:typing", onTyping);
      socket.on("chat:read", onRead);
      socket.on("chat:presence", onPresence);

      if (socket.connected) {
        onConnect();
      } else {
        socket.connect();
      }

      return () => {
        active = false;
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("chat:new", onNewMessage);
        socket.off("chat:typing", onTyping);
        socket.off("chat:read", onRead);
        socket.off("chat:presence", onPresence);
      };
    }

    let cleanup: (() => void) | undefined;
    setupRealtime().then((fn) => {
      cleanup = fn;
    });

    return () => {
      mounted = false;
      active = false;
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      cleanup?.();
    };
  }, [contract?.id, push, user]);

  async function handleSendMessage() {
    const content = chatInput.trim();
    if (!content || !contract?.id) return;
    const socket = getChatSocket();
    setSending(true);
    socket.emit("chat:send", { contractId: contract.id, content }, (res: any) => {
      setSending(false);
      if (!res?.ok) {
        push({
          title: "Không thể gửi tin nhắn",
          description: res?.error || "Vui lòng thử lại.",
          variant: "error",
        });
        return;
      }
      setChatInput("");
      socket.emit("chat:typing", { contractId: contract.id, isTyping: false });
    });
  }

  if (loading || loadingData) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải hợp đồng...
          </div>
        </Container>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Không tìm thấy hợp đồng.
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <h1 className="text-xl font-semibold text-slate-900">Chi tiết hợp đồng</h1>

          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div><span className="font-semibold">Mã hợp đồng:</span> {contract.id}</div>
            <div><span className="font-semibold">Trạng thái:</span> {contract.status}</div>
            <div><span className="font-semibold">Giá trị:</span> {Number(contract.price).toLocaleString("vi-VN")} VNĐ</div>
            {contract.dueAt && (
              <div><span className="font-semibold">Deadline:</span> {new Date(contract.dueAt).toLocaleDateString("vi-VN")}</div>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-sm font-semibold text-slate-900">Thông tin job</p>
              <div className="mt-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Tiêu đề:</span>{" "}
                  <Link href={`/jobs/${contract.jobId}`} className="text-sky-700 hover:underline">
                    {contract.job?.title || contract.jobId}
                  </Link>
                </p>
                {contract.job?.description && (
                  <p className="mt-1 text-slate-600">{contract.job.description}</p>
                )}
                {contract.job?.deadlineAt && (
                  <p className="mt-2"><span className="font-semibold">Deadline job:</span> {new Date(contract.job.deadlineAt).toLocaleDateString("vi-VN")}</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-sm font-semibold text-slate-900">Freelancer</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-sky-100">
                  <Image
                    src={contract.freelancer?.avatarUrl || "https://i.pravatar.cc/150?img=1"}
                    alt={contract.freelancer?.name || "Freelancer"}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Tên:</span>{" "}
                    <Link href={`/freelancers/${contract.freelancerId}`} className="text-sky-700 hover:underline">
                      {contract.freelancer?.name || contract.freelancerId}
                    </Link>
                  </p>
                  {contract.freelancer?.email && (
                    <p><span className="font-semibold">Email:</span> {contract.freelancer.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-900">Client</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-sky-100">
                <Image
                  src={
                    contract.client?.clientProfile?.companyLogoUrl ||
                    contract.client?.avatarUrl ||
                    "https://i.pravatar.cc/150?img=8"
                  }
                  alt={contract.client?.clientProfile?.companyName || contract.client?.name || "Client"}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Tên:</span>{" "}
                  <Link href={`/clients/${contract.clientId}`} className="text-sky-700 hover:underline">
                    {contract.client?.clientProfile?.companyName || contract.client?.name || contract.clientId}
                  </Link>
                </p>
                {contract.client?.email && (
                  <p><span className="font-semibold">Email:</span> {contract.client.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800">Khu vực bắt đầu làm việc</p>
                <p className="mt-1 text-sm text-emerald-700">
                  Contract đã tạo, client và freelancer có thể bắt đầu phối hợp triển khai công việc ngay.
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Hợp đồng: <span className="font-semibold">{contract.id}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/jobs/${contract.jobId}`}
                  className="rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  Xem lại công việc
                </Link>
                <Link
                  href={user?.role === "CLIENT" ? `/freelancers/${contract.freelancerId}` : `/clients/${contract.clientId}`}
                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Mở hồ sơ đối tác
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Chat theo hợp đồng</p>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    partnerOnline
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {partnerOnline ? "Đối tác online" : "Đối tác offline"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    chatConnected
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {chatConnected ? "Socket OK" : "Socket lỗi"}
                </span>
              </div>
            </div>

            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
              {messages.map((message) => {
                const own = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      own
                        ? "ml-auto bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {!own && (
                      <p className="text-[11px] font-semibold text-slate-600">
                        {message.sender?.name || "Đối tác"}
                      </p>
                    )}
                    <p>{message.content}</p>
                    <p className={`mt-1 text-[10px] ${own ? "text-sky-100" : "text-slate-500"}`}>
                      {new Date(message.createdAt).toLocaleString("vi-VN")}
                    </p>
                    {own && message.readAt && (
                      <p className="mt-0.5 text-[10px] text-sky-100">Đã xem</p>
                    )}
                  </div>
                );
              })}

              {messages.length === 0 && (
                <p className="text-center text-xs text-slate-500">
                  Chưa có tin nhắn nào. Hãy bắt đầu trao đổi công việc.
                </p>
              )}
              {partnerTyping && (
                <p className="text-xs text-slate-500">Đối tác đang nhập...</p>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setChatInput(value);
                  if (!contract?.id) return;
                  const socket = getChatSocket();
                  socket.emit("chat:typing", { contractId: contract.id, isTyping: value.trim().length > 0 });
                  if (typingTimeoutRef.current) {
                    window.clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = window.setTimeout(() => {
                    socket.emit("chat:typing", { contractId: contract.id, isTyping: false });
                  }, 1200);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={sending || !chatConnected || !chatInput.trim()}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

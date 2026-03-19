"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { fetchMyContracts } from "@/services/contracts";
import {
  approveMilestone,
  createMilestone,
  fetchContractMilestones,
  submitMilestone,
  updateMilestone,
  type Milestone,
} from "@/services/milestones";
import {
  ensureChatServerReady,
  getChatSocket,
  disconnectChatSocket,
} from "@/services/chat";
import {
  BadgeCheck,
  Clock,
  LoaderCircle,
  Send,
} from "lucide-react";

interface ContractDetail {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  price: number | string;
  dueAt?: string | null;
  job?: {
    id: string;
    title?: string | null;
    description?: string | null;
    location?: string | null;
    category?: string | null;
  } | null;
  client?: {
    id: string;
    name?: string | null;
    email?: string | null;
    clientProfile?: {
      companyName?: string | null;
    } | null;
  } | null;
  freelancer?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
}

const statusMeta: Record<Milestone["status"], { label: string; className: string }> = {
  PENDING: { label: "Chờ bắt đầu", className: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "Đang thực hiện", className: "bg-amber-100 text-amber-700" },
  SUBMITTED: { label: "Đã gửi", className: "bg-sky-100 text-sky-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
};

function formatDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const contractId = params?.id as string;

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const typingTimeout = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !contractId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoadingData(true);
        const res = await fetchMyContracts();
        const found = (res.contracts || []).find((item: ContractDetail) => item.id === contractId);
        if (!cancelled) {
          setContract(found || null);
        }
      } catch (err: any) {
        if (!cancelled) {
          push({
            title: "Không thể tải hợp đồng",
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
  }, [contractId, push, user]);

  useEffect(() => {
    if (!user || !contractId) return;
    let cancelled = false;

    async function loadMilestones() {
      try {
        setMilestoneLoading(true);
        const res = await fetchContractMilestones(contractId);
        if (!cancelled) {
          setMilestones(res.milestones || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setMilestones([]);
          push({
            title: "Không thể tải milestone",
            description: err?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setMilestoneLoading(false);
      }
    }

    loadMilestones();
    return () => {
      cancelled = true;
    };
  }, [contractId, push, user]);

  useEffect(() => {
    if (!user || !contractId) return;
    const currentUserId = user.id;
    let socket: ReturnType<typeof getChatSocket> | null = null;
    let cancelled = false;

    async function init() {
      await ensureChatServerReady();
      if (cancelled) return;
      socket = getChatSocket();
      socket.emit("chat:join", { contractId }, (resp: any) => {
        if (!resp?.ok) {
          return;
        }
        setMessages(resp.messages || []);
        setOnlineUserIds(resp.onlineUserIds || []);
      });

      socket.on("chat:new", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on("chat:presence", (payload: { onlineUserIds: string[] }) => {
        setOnlineUserIds(payload?.onlineUserIds || []);
      });

      socket.on("chat:typing", (payload: { userId: string; isTyping: boolean }) => {
        const { userId, isTyping } = payload || {};
        if (!userId || userId === currentUserId) return;
        if (isTyping) {
          setTypingUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
          if (typingTimeout.current[userId]) {
            clearTimeout(typingTimeout.current[userId]);
          }
          typingTimeout.current[userId] = setTimeout(() => {
            setTypingUserIds((prev) => prev.filter((id) => id !== userId));
          }, 1500);
        } else {
          setTypingUserIds((prev) => prev.filter((id) => id !== userId));
        }
      });

      socket.on("chat:read", () => {
        // optional hook
      });
    }

    init();
    return () => {
      cancelled = true;
      if (socket) {
        socket.off("chat:new");
        socket.off("chat:presence");
        socket.off("chat:typing");
        socket.off("chat:read");
      }
      disconnectChatSocket();
    };
  }, [contractId, user]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages]);

  const isClient = user?.role === "CLIENT";
  const isFreelancer = user?.role === "FREELANCER";

  const partnerName = useMemo(() => {
    if (!contract || !user) return "";
    if (user.role === "CLIENT") {
      return contract.freelancer?.name || contract.freelancer?.email || "Freelancer";
    }
    return (
      contract.client?.clientProfile?.companyName ||
      contract.client?.name ||
      contract.client?.email ||
      "Client"
    );
  }, [contract, user]);

  const canEditMilestone = (milestone: Milestone) =>
    isClient && (milestone.status === "PENDING" || milestone.status === "IN_PROGRESS");

  async function handleCreateMilestone() {
    if (!title.trim()) {
      push({
        title: "Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề milestone.",
        variant: "error",
      });
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      push({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập ngân sách hợp lệ.",
        variant: "error",
      });
      return;
    }

    try {
      setMilestoneLoading(true);
      await createMilestone({
        contractId,
        title: title.trim(),
        amount: numericAmount,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setTitle("");
      setAmount("");
      setDueDate("");
      const res = await fetchContractMilestones(contractId);
      setMilestones(res.milestones || []);
      push({ title: "Đã tạo milestone", variant: "success" });
    } catch (err: any) {
      push({
        title: "Không thể tạo milestone",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setMilestoneLoading(false);
    }
  }

  async function handleStartMilestone(milestone: Milestone) {
    try {
      setMilestoneLoading(true);
      await updateMilestone(milestone.id, { status: "IN_PROGRESS" });
      const res = await fetchContractMilestones(contractId);
      setMilestones(res.milestones || []);
      push({ title: "Đã cập nhật trạng thái", variant: "success" });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setMilestoneLoading(false);
    }
  }

  async function handleSubmitMilestone(milestone: Milestone) {
    try {
      setMilestoneLoading(true);
      await submitMilestone(milestone.id);
      const res = await fetchContractMilestones(contractId);
      setMilestones(res.milestones || []);
      push({ title: "Đã gửi milestone", variant: "success" });
    } catch (err: any) {
      push({
        title: "Không thể gửi milestone",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setMilestoneLoading(false);
    }
  }

  async function handleApproveMilestone(milestone: Milestone) {
    try {
      setMilestoneLoading(true);
      await approveMilestone(milestone.id);
      const res = await fetchContractMilestones(contractId);
      setMilestones(res.milestones || []);
      push({ title: "Đã duyệt milestone", variant: "success" });
    } catch (err: any) {
      push({
        title: "Không thể duyệt milestone",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setMilestoneLoading(false);
    }
  }

  async function handleSaveEdit(milestone: Milestone) {
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      push({
        title: "Tiêu đề không hợp lệ",
        description: "Vui lòng nhập tiêu đề milestone (tối thiểu 3 ký tự).",
        variant: "error",
      });
      return;
    }
    const numericAmount = Number(editAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      push({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập ngân sách hợp lệ.",
        variant: "error",
      });
      return;
    }
    try {
      setMilestoneLoading(true);
      await updateMilestone(milestone.id, {
        title: editTitle.trim(),
        amount: numericAmount,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      });
      const res = await fetchContractMilestones(contractId);
      setMilestones(res.milestones || []);
      setEditingId(null);
      push({ title: "Đã cập nhật milestone", variant: "success" });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật milestone",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setMilestoneLoading(false);
    }
  }

  async function handleSendMessage() {
    const content = messageInput.trim();
    if (!content) return;
    const socket = getChatSocket();
    try {
      setSendingMessage(true);
      socket.emit(
        "chat:send",
        { contractId, content },
        (resp: { ok: boolean; error?: string; message?: ChatMessage }) => {
          if (!resp?.ok) {
            push({
              title: "Không thể gửi tin nhắn",
              description: resp?.error || "Vui lòng thử lại.",
              variant: "error",
            });
            setSendingMessage(false);
            return;
          }
          setMessageInput("");
          setSendingMessage(false);
        }
      );
    } catch (err: any) {
      setSendingMessage(false);
      push({
        title: "Không thể gửi tin nhắn",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    }
  }

  function handleTyping(isTyping: boolean) {
    const socket = getChatSocket();
    socket.emit("chat:typing", { contractId, isTyping });
  }

  function scrollToMilestoneForm() {
    const target = document.getElementById("milestone-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  if (!user) return null;

  if (!contract) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Không tìm thấy hợp đồng này.
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-600">
                    Hợp đồng
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                    {contract.job?.title || "Hợp đồng"}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Đối tác: {partnerName}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p>
                    Giá trị: {Number(contract.price).toLocaleString("vi-VN")} VNĐ
                  </p>
                  {contract.dueAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Deadline: {new Date(contract.dueAt).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
              {contract.job?.description && (
                <p className="mt-4 text-sm text-slate-600">{contract.job.description}</p>
              )}
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Milestone</h2>
                  <p className="text-sm text-slate-500">
                    Theo dõi tiến độ và thanh toán theo giai đoạn.
                  </p>
                </div>
                {isClient && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTitle("");
                      setAmount("");
                      setDueDate("");
                    }}
                  >
                    Làm mới
                  </Button>
                )}
              </div>

              {isClient && (
                <div
                  id="milestone-form"
                  className="mt-4 grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-[1.4fr_0.7fr_0.7fr_auto]"
                >
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tên milestone"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                  />
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Số tiền"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateMilestone}
                    disabled={milestoneLoading}
                  >
                    Tạo
                  </Button>
                </div>
              )}

              <div className="mt-5 space-y-3">
                {milestones.map((milestone) => {
                  const meta = statusMeta[milestone.status];
                  const isEditing = editingId === milestone.id;

                  return (
                    <div
                      key={milestone.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{milestone.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Số tiền: {Number(milestone.amount).toLocaleString("vi-VN")} VNĐ
                          </p>
                          {milestone.dueDate && (
                            <p className="mt-1 text-xs text-slate-500">
                              Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {isEditing && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_0.7fr_0.7fr_auto]">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Tiêu đề"
                            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                          />
                          <input
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="Số tiền"
                            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                          />
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(milestone)}
                              disabled={milestoneLoading}
                            >
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {isClient && milestone.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStartMilestone(milestone)}
                            disabled={milestoneLoading}
                          >
                            Bắt đầu
                          </Button>
                        )}
                        {isFreelancer && milestone.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitMilestone(milestone)}
                            disabled={milestoneLoading}
                          >
                            Gửi milestone
                          </Button>
                        )}
                        {isClient && milestone.status === "SUBMITTED" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveMilestone(milestone)}
                            disabled={milestoneLoading}
                          >
                            Duyệt
                          </Button>
                        )}
                        {canEditMilestone(milestone) && !isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(milestone.id);
                              setEditTitle(milestone.title);
                              setEditAmount(String(milestone.amount));
                              setEditDueDate(formatDateInput(milestone.dueDate));
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                        )}
                        {milestone.status === "APPROVED" && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Đã thanh toán (demo)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!milestoneLoading && milestones.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Chưa có milestone nào.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Xem trước các giai đoạn
                  </h2>
                  <p className="text-sm text-slate-500">
                    Tổng hợp milestone để dễ theo dõi tiến độ.
                  </p>
                </div>
                {isClient && (
                  <Button size="sm" variant="secondary" onClick={scrollToMilestoneForm}>
                    Thêm giai đoạn
                  </Button>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {milestones.map((milestone) => {
                  const meta = statusMeta[milestone.status];
                  return (
                    <div
                      key={milestone.id}
                      className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${meta.className}`}
                          >
                            {milestone.status === "PENDING" && <Clock className="h-4 w-4" />}
                            {milestone.status === "IN_PROGRESS" && (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            {milestone.status === "SUBMITTED" && <Send className="h-4 w-4" />}
                            {milestone.status === "APPROVED" && <BadgeCheck className="h-4 w-4" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-6">
                              {milestone.title}
                            </p>
                            {milestone.dueDate && (
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-sky-600">
                          {Number(milestone.amount).toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                      <div className="mt-3 h-px w-full bg-slate-100" />
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Trạng thái: <span className="text-slate-700">{meta.label}</span>
                      </p>
                    </div>
                  );
                })}

                {milestones.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Chưa có giai đoạn nào.
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Chat hợp đồng</h2>
                  <p className="text-xs text-slate-500">
                    Đang online: {onlineUserIds.length}
                  </p>
                </div>
              </div>

              <div
                ref={messageListRef}
                className="mt-4 max-h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
              >
                {messages.length === 0 && (
                  <p className="text-center text-sm text-slate-400">Chưa có tin nhắn.</p>
                )}
                {messages.map((message) => {
                  const isMine = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? "bg-sky-500 text-white"
                            : "bg-white text-slate-700 border border-slate-100"
                        }`}
                      >
                        <p className="font-medium">
                          {isMine ? "Bạn" : message.sender?.name || message.sender?.email || "Đối tác"}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                        <p className="mt-1 text-[11px] opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {typingUserIds.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">Đối tác đang nhập...</p>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  placeholder="Nhập tin nhắn..."
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                >
                  Gửi
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Thông tin hợp đồng</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Trạng thái: {contract.status}</p>
                {contract.job?.category && <p>Lĩnh vực: {contract.job.category}</p>}
                {contract.job?.location && <p>Địa điểm: {contract.job.location}</p>}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

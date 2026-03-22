const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'contracts', '[id]', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const splitMarker = '  if (loading || loadingData) {';
const splitIndex = content.indexOf(splitMarker);

if (splitIndex === -1) {
  console.error("Could not find the split marker");
  process.exit(1);
}

const headerPart = content.substring(0, splitIndex);

const newJsx = `  if (loading || loadingData) {
    return (
      <div className="py-8 bg-[#F8FAFC] min-h-screen">
        <Container>
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-white">
            <LoaderCircle className="h-8 w-8 animate-spin text-sky-500" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu hợp đồng...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!user) return null;
  if (!contract) {
    return (
      <div className="py-8 bg-[#F8FAFC] min-h-screen">
        <Container>
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-600 shadow-sm">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900">Không tìm thấy hợp đồng</h2>
            <p className="mt-2 text-slate-500">Liên kết có thể bị sai hoặc bạn không có quyền truy cập.</p>
          </div>
        </Container>
      </div>
    );
  }

  const totalBudget = Number(contract.price || 0);
  const paidAmount = milestones.filter(m => m.status === "APPROVED").reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const progressPercent = totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 0;
  
  const msRemaining = contract.dueAt ? new Date(contract.dueAt).getTime() - Date.now() : 0;
  const daysRemaining = msRemaining > 0 ? Math.ceil(msRemaining / (1000 * 60 * 60 * 24)) : 0;
  const deadlineDateObj = contract.dueAt ? new Date(contract.dueAt) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          
          {/* CỘT TRÁI (MAIN) */}
          <div className="flex flex-col gap-6">
            
            {/* Header Title */}
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">
                {contract.job?.title || "Hợp đồng dự án"}
              </h1>
              <span className={\`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] \${contract.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}\`}>
                {contract.status === "ACTIVE" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {contract.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : \`ĐÃ \${contract.status}\`}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {contract.job?.description || "Thiết kế giao diện ứng dụng quản lý tài chính cá nhân với phong cách hiện đại, tập trung vào trải nghiệm người dùng và tính bảo mật cao."}
            </p>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Box 1 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Tổng ngân sách</p>
                <p className="mt-3 text-2xl font-black text-blue-600 tracking-tight">{totalBudget.toLocaleString("vi-VN")}đ</p>
                <div className="mt-5 flex flex-col gap-2">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-slate-400">Tiến độ thực tế</span>
                      <span className="text-[11px] font-bold text-blue-600">{progressPercent}%</span>
                   </div>
                   <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{width: \`\${progressPercent}%\`}} />
                   </div>
                </div>
              </div>

              {/* Box 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Đã thanh toán</p>
                <p className="mt-3 text-2xl font-black text-emerald-500 tracking-tight">{paidAmount.toLocaleString("vi-VN")}đ</p>
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50/50 p-2">
                   <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <BadgeCheck className="h-3 w-3" />
                   </div>
                   <p className="text-[10px] font-semibold text-emerald-700 leading-tight">Thanh toán an toàn<br/>qua Fast-Job</p>
                </div>
              </div>

              {/* Box 3 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Thời hạn dự kiến</p>
                <p className="mt-3 text-2xl font-black text-slate-800 tracking-tight">
                   {deadlineDateObj ? \`\${deadlineDateObj.getDate()} Thg \${deadlineDateObj.getMonth()+1}\` : "N/A"}
                </p>
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                   <Clock className="h-4 w-4 shrink-0 text-blue-500" />
                   <p className="text-[10px] font-semibold text-slate-600">
                     {daysRemaining > 0 ? \`Còn lại \${daysRemaining} ngày làm việc\` : "Đã quá hạn / Không rõ"}
                   </p>
                </div>
              </div>
            </div>

            {/* Chi tiết các giai đoạn */}
            <div className="mt-4 flex flex-col gap-4">
               <div className="flex items-center gap-2">
                 <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600"><FileText className="h-3.5 w-3.5" /></div>
                 <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Chi tiết các giai đoạn</h2>
               </div>

               {isClient && (
                  <div className="grid gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 sm:grid-cols-[1.4fr_0.7fr_0.7fr_auto]">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên giai đoạn mới" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition" />
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ngân sách (VNĐ)" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition" />
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition" />
                    <Button size="sm" onClick={handleCreateMilestone} disabled={milestoneLoading} className="h-10 px-5 shadow-sm">Tạo nhanh</Button>
                  </div>
               )}

               <div className="flex flex-col gap-4">
                 {milestones.length === 0 && <p className="text-sm font-medium text-slate-400 italic">Dự án chưa có giai đoạn triển khai nào.</p>}
                 {milestones.map((m, idx) => {
                   const isEditing = editingId === m.id;
                   const isApproved = m.status === "APPROVED";
                   const isActive = m.status === "IN_PROGRESS" || m.status === "SUBMITTED";
                   const isPending = m.status === "PENDING";

                   let wrapperClass = "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 transition-all ";
                   if (isApproved) wrapperClass += "border-slate-100 bg-white opacity-60 grayscale-[30%]";
                   else if (isActive) wrapperClass += "border-blue-300 bg-white shadow-[0_8px_30px_-12px_rgba(59,130,246,0.2)] scale-[1.01]";
                   else wrapperClass += "border-dashed border-slate-200 bg-slate-50/50";

                   return (
                     <div key={m.id} className={wrapperClass}>
                        <div className="flex items-start gap-4">
                           <div className="mt-0.5 flex shrink-0">
                               {isApproved && <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-500"><BadgeCheck className="h-5 w-5"/></div>}
                               {isActive && <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500"><div className="flex gap-0.5"><div className="h-1 w-1 rounded-full bg-blue-500 animate-bounce"/><div className="h-1 w-1 rounded-full bg-blue-500 animate-bounce delay-75"/><div className="h-1 w-1 rounded-full bg-blue-500 animate-bounce delay-150"/></div></div>}
                               {isPending && <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-300"><Lock className="h-4 w-4"/></div>}
                           </div>
                           <div className="flex flex-col gap-1">
                               <h3 className={\`text-base font-extrabold \${isActive ? "text-slate-900" : "text-slate-700"}\`}>Giai đoạn \${idx+1}: \${m.title}</h3>
                               <p className="text-xs font-semibold text-slate-500">
                                  {isApproved && m.approvedAt ? \`Đã hoàn thành và giải ngân vào \${new Date(m.approvedAt).toLocaleDateString("vi-VN")}\` :
                                   isApproved ? "Đã quyế t toán thành công" :
                                   isActive ? "Đang đẩy nhanh tiến độ thiết kế & lập trình" :
                                   \`Sẽ được kích hoạt sau khi giai đoạn trước hoàn thành\`}
                               </p>
                           </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-3 mt-2 sm:mt-0">
                           <div className={\`flex items-center gap-3 sm:flex-col sm:gap-1 text-right \${isActive ? "text-blue-600" : "text-slate-600"}\`}>
                              <span className="text-lg font-black tracking-tight">{Number(m.amount).toLocaleString("vi-VN")}đ</span>
                              <span className={\`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest \${isActive ? "bg-blue-100/50 text-blue-600" : isApproved ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}\`}>
                                {isActive ? "Đang thực hiện" : isApproved ? "Đã quyết toán" : "Khóa"}
                              </span>
                           </div>

                           {!isEditing && (
                              <div className="flex gap-2">
                                {isClient && isPending && <Button size="sm" variant="secondary" className="shadow-sm" onClick={() => handleStartMilestone(m)} disabled={milestoneLoading}>Khởi động</Button>}
                                {isClient && m.status === "SUBMITTED" && <Button size="sm" className="bg-blue-600 px-6 shadow-md shadow-blue-600/20" onClick={() => handleApproveMilestone(m)} disabled={milestoneLoading}>Giải ngân thanh toán</Button>}
                                {isFreelancer && m.status === "IN_PROGRESS" && <Button size="sm" variant="secondary" className="bg-slate-100 hover:bg-slate-200 shadow-sm" onClick={() => handleSubmitMilestone(m)} disabled={milestoneLoading}><FileText className="mr-2 h-3.5 w-3.5"/> Nộp sản phẩm</Button>}
                                {isClient && isPending && <Button size="sm" variant="ghost" onClick={() => { setEditingId(m.id); setEditTitle(m.title); setEditAmount(String(m.amount)); setEditDueDate(formatDateInput(m.dueDate)); }}><SquarePen className="h-4 w-4 text-slate-400"/></Button>}
                              </div>
                           )}

                           {isEditing && (
                             <div className="mt-2 grid gap-1.5 w-full sm:w-auto">
                                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Tiêu đề" className="h-8 rounded-lg border px-2 text-xs font-semibold" />
                                <input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="Số tiền" className="h-8 rounded-lg border px-2 text-xs font-semibold" />
                                <div className="flex gap-1.5">
                                  <Button size="sm" className="h-7 text-[10px] px-3 w-full" onClick={() => handleSaveEdit(m)} disabled={milestoneLoading}>Lưu</Button>
                                  <Button size="sm" variant="secondary" className="h-7 text-[10px] px-3 w-full" onClick={() => setEditingId(null)}>Hủy</Button>
                                </div>
                             </div>
                           )}
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* Tài liệu & Tệp tin */}
            <div className="mt-6 flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600"><FileText className="h-3.5 w-3.5" /></div>
                   <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Tài liệu & Tệp tin</h2>
                 </div>
                 <button className="text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:underline">Xem tất cả</button>
               </div>

               <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                 {resources.map((res) => (
                    <div key={res.id} className="group relative flex h-28 flex-col justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow-md transition cursor-pointer" onClick={() => res.type === "IMAGE" ? setPreviewResource(res) : setDownloadTarget(res)}>
                      {res.uploaderId === user.id && (
                        <button onClick={(e) => {e.stopPropagation(); setDeleteTarget(res);}} className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      {res.type === "LINK" ? <LinkIcon className="mb-2.5 h-6 w-6 text-blue-500" /> : res.type === "IMAGE" ? <ImageIcon className="mb-2.5 h-6 w-6 text-emerald-500"/> : <FileText className="mb-2.5 h-6 w-6 text-blue-500" />}
                      
                      <p className="w-full truncate text-[11px] font-bold text-slate-800 tracking-tight">{res.fileName || res.url}</p>
                      <p className="mt-1 text-[9px] font-bold text-slate-400">
                         {res.fileSize ? \`\${(res.fileSize/1024/1024).toFixed(1)} MB • \` : ''} 
                         {new Date(res.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                 ))}
                 
                 <div onClick={() => fileInputRef.current?.click()} className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 hover:border-blue-400 hover:bg-blue-50/50 transition relative">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-500 font-bold overflow-hidden">
                       <span className="text-xl inline-block -mt-0.5">+</span>
                    </div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-center">Tải lên tệp mới</p>
                    
                    <button onClick={(e) => {e.stopPropagation(); setShowLinkModal(true);}} className="absolute bottom-1 right-1 px-2 py-1 text-[9px] font-bold text-blue-500 hover:underline">Hoặc Link</button>
                 </div>
               </div>
            </div>

          </div>

          {/* CỘT PHẢI (SIDEBAR) */}
          <div className="flex flex-col gap-6">
             
             {/* Quản lý hợp đồng Panel */}
             <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-800">Quản lý hợp đồng</p>
                <div className="flex flex-col gap-3">
                   <Button variant="secondary" className="flex h-11 w-full justify-between rounded-xl bg-white shadow-sm border border-slate-100 text-slate-700 hover:border-slate-300 font-bold" onClick={() => setShowEditContract(!showEditContract)} disabled={!isClient}>
                     Sửa đổi hợp đồng <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-blue-500"><SquarePen className="h-3 w-3"/></div>
                   </Button>
                   {showEditContract && (
                      <div className="grid gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                         <input value={editContractPrice} onChange={(e) => setEditContractPrice(e.target.value)} placeholder="Giá trị hợp đồng" className="h-9 w-full rounded-lg border px-3 text-sm font-semibold outline-none focus:border-blue-400" />
                         <input type="date" value={editContractDueAt} onChange={(e) => setEditContractDueAt(e.target.value)} className="h-9 w-full rounded-lg border px-3 text-sm font-semibold outline-none focus:border-blue-400" />
                         <Button size="sm" onClick={handleUpdateContract} disabled={savingContract} className="w-full h-9 font-bold bg-slate-800">Lưu thay đổi</Button>
                      </div>
                   )}

                   <Button variant="secondary" className="flex h-11 w-full justify-between rounded-xl bg-white shadow-sm border border-slate-100 text-rose-600 hover:border-rose-200 hover:bg-rose-50 font-bold" onClick={handleFinishContract} disabled={!isClient}>
                     Kết thúc hợp đồng <div className="flex h-6 w-6 items-center justify-center rounded bg-rose-50 text-rose-500"><XCircle className="h-3 w-3"/></div>
                   </Button>

                   <Button variant="secondary" className="flex h-11 w-full justify-between rounded-xl bg-white shadow-sm border border-slate-100 text-amber-600 hover:border-amber-200 hover:bg-amber-50 font-bold" onClick={() => setShowSupportForm(!showSupportForm)}>
                     Yêu cầu hỗ trợ <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-50 text-amber-500"><Flag className="h-3 w-3"/></div>
                   </Button>
                   {showSupportForm && (
                      <div className="grid gap-2 rounded-xl bg-amber-50/50 p-3 border border-amber-100">
                         <input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Tiêu đề hỗ trợ" className="h-9 w-full rounded-lg border border-amber-200 px-3 text-sm font-semibold outline-none focus:border-amber-400 bg-white" />
                         <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} rows={2} placeholder="Nội dung cần hỗ trợ" className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-400 bg-white" />
                         <Button size="sm" onClick={handleCreateSupportTicket} disabled={sendingSupport} className="w-full h-9 font-bold bg-amber-600 hover:bg-amber-700">Gửi hỗ trợ</Button>
                      </div>
                   )}
                </div>
             </div>

             {/* Chat System */}
             <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-sm min-h-[500px] overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">Thảo luận trực tiếp</p>
                   <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" ref={messageListRef}>
                   <div className="flex justify-center"><div className="rounded-full bg-slate-200/60 px-3 py-1 text-[9px] font-black tracking-widest text-slate-500">HÔM NAY</div></div>
                   
                   {messages.map((msg) => {
                      const isMine = msg.senderId === user.id;
                      const senderName = isMine ? "BẠN" : (msg.sender?.name || "KHÁCH HÀNG");
                      // Using a safe fallback avatar instead of complex SVG string
                      const avatarUrl = msg.sender?.avatarUrl || \`https://ui-avatars.com/api/?name=\${senderName}&background=random\`;
                      
                      return (
                        <div key={msg.id} className={\`flex gap-3 \${isMine ? "flex-row-reverse" : "flex-row"}\`}>
                           <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm bg-slate-200 border border-slate-100">
                             <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                           </div>
                           <div className={\`flex flex-col \${isMine ? "items-end" : "items-start"}\`}>
                              <div className={\`mb-1 flex items-baseline gap-2 \${isMine ? "flex-row-reverse" : "flex-row"}\`}>
                                 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">{senderName}</span>
                                 <span className="text-[9px] font-bold text-slate-400">{new Date(msg.createdAt).toLocaleTimeString("vi-VN", {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                              <div className={\`max-w-[260px] rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-relaxed \${isMine ? "bg-blue-500 text-white rounded-tr-sm shadow-md shadow-blue-500/20" : "bg-white text-slate-700 rounded-tl-sm border border-slate-200 shadow-sm"}\`}>
                                 {msg.content}
                              </div>
                           </div>
                        </div>
                      )
                   })}
                   {typingUserIds.length > 0 && (
                      <div className="flex gap-3">
                         <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200" />
                         <div className="flex flex-col items-start">
                            <div className="mb-1 flex items-baseline gap-2">
                               <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">ĐỐI TÁC</span>
                            </div>
                            <div className="flex max-w-[260px] items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                               <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                               <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{animationDelay: "150ms"}} />
                               <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{animationDelay: "300ms"}} />
                            </div>
                         </div>
                      </div>
                   )}
                </div>

                <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center gap-2">
                   <div className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 relative pointer-events-none">
                     <span className="text-xl inline-block -mt-1">+</span> 
                     {/* Can bind file upload here if needed, but keeping it simple */}
                   </div>
                   <input
                     value={messageInput}
                     onChange={(e) => setMessageInput(e.target.value)}
                     onFocus={() => handleTyping(true)}
                     onBlur={() => handleTyping(false)}
                     onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                     placeholder="Nhập tin nhắn..."
                     className="h-10 flex-1 rounded-full bg-slate-50 px-4 text-[13px] font-semibold text-slate-800 outline-none border border-slate-200 focus:border-blue-400 focus:bg-white transition"
                   />
                   <div onClick={!sendingMessage && messageInput.trim() ? handleSendMessage : undefined} className={\`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition \${messageInput.trim() ? "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-600/30" : "bg-slate-300 pointer-events-none"}\`}>
                     <Send className="h-4 w-4 -ml-0.5" />
                   </div>
                </div>
             </div>

          </div>
        </div>

        {/* --- MODALS IN PLACE --- */}

        {/* Add Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowLinkModal(false)}>
             <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Thêm liên kết</h3>
                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="w-full h-11 mb-5 border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-blue-400" />
                <div className="flex gap-3">
                   <Button size="sm" onClick={handleAddLink} className="flex-1 h-10 font-bold bg-blue-600">Thêm</Button>
                   <Button size="sm" variant="secondary" onClick={() => setShowLinkModal(false)} className="flex-1 h-10 font-bold bg-slate-100 hover:bg-slate-200 border-none text-slate-700">Hủy</Button>
                </div>
             </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-sm" onClick={() => setPreviewResource(null)}>
            <div className="relative max-h-[90vh] max-w-5xl" onClick={e => e.stopPropagation()}>
              <button className="absolute -top-12 right-0 text-white/50 hover:text-white transition" onClick={() => setPreviewResource(null)}>
                <XCircle className="h-10 w-10" />
              </button>
              <img src={getUrl(previewResource.url)} alt="Preview" className="max-h-[80vh] rounded-2xl shadow-2xl object-contain bg-white" />
              <div className="mt-6 flex justify-center">
                 <a href={getDownloadUrl(previewResource.url, previewResource.fileName || "image")} download className="rounded-full bg-white px-8 py-3 text-sm font-extrabold text-slate-900 hover:scale-105 transition shadow-xl">Tải xuống ngay</a>
              </div>
            </div>
          </div>
        )}

        {/* Download Confirm */}
        {downloadTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setDownloadTarget(null)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FileText className="h-6 w-6"/></div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Xác nhận tải xuống</h3>
              <p className="mt-2 text-sm text-slate-600 font-medium">Bạn có muốn tải tệp <strong className="text-slate-900">{downloadTarget.fileName || "Tệp đính kèm"}</strong> về máy?</p>
              <div className="mt-6 grid gap-2">
                <a href={getDownloadUrl(downloadTarget.url, downloadTarget.fileName || "download")} download onClick={() => setDownloadTarget(null)} className="rounded-xl bg-blue-600 py-3 text-center text-sm font-extrabold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30">Tải xuống</a>
                <Button variant="secondary" className="rounded-xl py-3 text-sm border-none bg-slate-100 font-extrabold text-slate-600 mt-2" onClick={() => setDownloadTarget(null)}>Đóng lại</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600"><XCircle className="h-6 w-6"/></div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Xóa tài liệu</h3>
              <p className="mt-2 text-sm text-slate-600 font-medium">Bạn có chắc chắn muốn xóa vĩnh viễn <strong className="text-slate-900">{deleteTarget.fileName || deleteTarget.url || "Tệp"}</strong> không? Sẽ không thể hoàn tác.</p>
              <div className="mt-6 grid gap-2">
                <Button onClick={executeDeleteResource} className="rounded-xl bg-rose-600 py-3 text-center text-sm font-extrabold text-white hover:bg-rose-700 h-auto">Xóa ngay</Button>
                <Button variant="secondary" className="rounded-xl py-3 text-sm border-none bg-slate-100 font-extrabold text-slate-600 mt-2 h-auto" onClick={() => setDeleteTarget(null)}>Lúc khác</Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
`;

fs.writeFileSync(targetFile, headerPart + newJsx);
console.log("Successfully patched page.tsx");

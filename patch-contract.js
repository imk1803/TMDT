const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'contracts', '[id]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add hook states around line 147
const hookHooksRegex = /const \[showSupportForm, setShowSupportForm\] = useState\(false\);/;
if (content.match(hookHooksRegex)) {
  content = content.replace(
    hookHooksRegex,
    `const [showSupportForm, setShowSupportForm] = useState(false);\n  const [showConfirmEnd, setShowConfirmEnd] = useState(false);\n  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);\n  const [showConfirmSupport, setShowConfirmSupport] = useState(false);`
  );
}

// 2. Wrap actions in modals
content = content.replace(
  /onClick=\{handleUpdateContract\}/g,
  `onClick={() => setShowConfirmUpdate(true)}`
);

content = content.replace(
  /onClick=\{handleFinishContract\}/g,
  `onClick={() => setShowConfirmEnd(true)}`
);

content = content.replace(
  /onClick=\{handleCreateSupportTicket\}/g,
  `onClick={() => setShowConfirmSupport(true)}`
);

// 3. Lock down completed features
// Milestone Create form
content = content.replace(
  /\{isClient && \(\s*<div className="grid gap-3 rounded-2xl border border-dashed/g,
  `{isClient && contract.status === "ACTIVE" && (\n                  <div className="grid gap-3 rounded-2xl border border-dashed`
);

// Milestone List Action Buttons inside !isEditing
content = content.replace(
  /\{!isEditing && \(\s*<div className="flex gap-2">\s*\{isClient && isPending && <Button size="sm" variant="secondary"/g,
  `{!isEditing && (\n                              <div className="flex gap-2">\n                                {isClient && isPending && contract.status === "ACTIVE" && <Button size="sm" variant="secondary"`
);

content = content.replace(
  /\{isClient && m\.status === "SUBMITTED" && <Button size="sm"/g,
  `{isClient && m.status === "SUBMITTED" && contract.status === "ACTIVE" && <Button size="sm"`
);

content = content.replace(
  /\{isFreelancer && m\.status === "IN_PROGRESS" && <Button size="sm"/g,
  `{isFreelancer && m.status === "IN_PROGRESS" && contract.status === "ACTIVE" && <Button size="sm"`
);

content = content.replace(
  /\{isClient && isPending && <Button size="sm" variant="ghost"/g,
  `{isClient && isPending && contract.status === "ACTIVE" && <Button size="sm" variant="ghost"`
);

// Hide Upload tile
content = content.replace(
  /<div onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\} className="flex h-28 cursor-pointer flex-col items-center/g,
  `{contract.status === "ACTIVE" && (\n                 <div onClick={() => fileInputRef.current?.click()} className="flex h-28 cursor-pointer flex-col items-center`
);

content = content.replace(
  /<button onClick=\{\(e\) => \{e\.stopPropagation\(\); setShowLinkModal\(true\);\}\} className="absolute bottom-1 right-1 px-2 py-1 text-\[9px\] font-bold text-blue-500 hover:underline">Hoặc Link<\/button>\s*<\/div>/g,
  `<button onClick={(e) => {e.stopPropagation(); setShowLinkModal(true);}} className="absolute bottom-1 right-1 px-2 py-1 text-[9px] font-bold text-blue-500 hover:underline">Hoặc Link</button>\n                 </div>\n                 )}`
);

// Disable chat input
const chatInputSection = `                <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center gap-2">
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
                </div>`;

const chatInputReplacement = `{contract.status === "ACTIVE" ? (
                <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center gap-2">
                   <div className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 relative pointer-events-none">
                     <span className="text-xl inline-block -mt-1">+</span> 
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
                ) : (
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-center">
                   <p className="text-xs font-semibold text-slate-500">Hợp đồng đã kết thúc. Chat bị khóa.</p>
                </div>
                )}`;

content = content.replace(chatInputSection, chatInputReplacement);


// 4. Inject Modals
const modalsCode = `        {/* ACTION CONFIRM MODALS */}
        {showConfirmUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setShowConfirmUpdate(false)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><SquarePen className="h-6 w-6"/></div>
              <h3 className="text-xl font-bold text-slate-900">Sửa đổi hợp đồng</h3>
              <p className="mt-2 text-sm text-slate-600">Bạn có chắc chắn muốn lưu các thay đổi về thẻ giá/thời hạn cho hợp đồng này?</p>
              <div className="mt-6 grid gap-2">
                <Button onClick={() => { setShowConfirmUpdate(false); handleUpdateContract(); }} disabled={savingContract} className="rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">Xác nhận Lưu</Button>
                <Button variant="secondary" className="rounded-xl bg-slate-100 py-3 font-bold text-slate-600 mt-2" onClick={() => setShowConfirmUpdate(false)}>Hủy bỏ</Button>
              </div>
            </div>
          </div>
        )}

        {showConfirmEnd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setShowConfirmEnd(false)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600"><XCircle className="h-6 w-6"/></div>
              <h3 className="text-xl font-bold text-slate-900">Kết thúc hợp đồng</h3>
              <p className="mt-2 text-sm text-slate-600">Hành động này sẽ đóng tất cả tương tác, chốt công nợ và chuyển sang trạng thái đã hoàn thành. Bạn có chắc không?</p>
              <div className="mt-6 grid gap-2">
                <Button onClick={() => { setShowConfirmEnd(false); handleFinishContract(); }} disabled={savingContract} className="rounded-xl bg-rose-600 py-3 font-bold text-white hover:bg-rose-700">Đồng ý Kết thúc</Button>
                <Button variant="secondary" className="rounded-xl bg-slate-100 py-3 font-bold text-slate-600 mt-2" onClick={() => setShowConfirmEnd(false)}>Hủy bỏ</Button>
              </div>
            </div>
          </div>
        )}

        {showConfirmSupport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setShowConfirmSupport(false)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500"><Flag className="h-6 w-6"/></div>
              <h3 className="text-xl font-bold text-slate-900">Gửi yêu cầu hỗ trợ</h3>
              <p className="mt-2 text-sm text-slate-600">Yêu cầu của bạn sẽ được gửi tới bộ phận Chăm sóc khách hàng. Bạn có muốn tiếp tục gửi?</p>
              <div className="mt-6 grid gap-2">
                <Button onClick={() => { setShowConfirmSupport(false); handleCreateSupportTicket(); }} disabled={sendingSupport} className="rounded-xl bg-amber-600 py-3 font-bold text-white hover:bg-amber-700">Xác nhận gửi</Button>
                <Button variant="secondary" className="rounded-xl bg-slate-100 py-3 font-bold text-slate-600 mt-2" onClick={() => setShowConfirmSupport(false)}>Hủy bỏ</Button>
              </div>
            </div>
          </div>
        )}

        {/* --- EXISTING MODALS IN PLACE --- */}`;

content = content.replace(/{ \/\* --- MODALS IN PLACE --- \*\/ }/g, modalsCode);

fs.writeFileSync(filePath, content);
console.log("Successfully patched page.tsx inside detail");

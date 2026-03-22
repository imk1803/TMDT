"use client";

import { useEffect, useState } from "react";
import { fetchAdminTransactions, fetchAdminRevenue } from "@/services/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { DollarSign, TrendingUp, Users, Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminFinanceDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState({ platformRevenue: 0, userVolume: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAdminTransactions().catch(() => []),
      fetchAdminRevenue().catch(() => ({ platformRevenue: 0, userVolume: 0 }))
    ]).then(([txData, revData]) => {
      setTransactions(txData || []);
      setRevenueStats(revData);
      setLoading(false);
    });
  }, []);

  const totalRevenue = revenueStats.platformRevenue;
  const gmv = revenueStats.userVolume;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const revThisMonth = transactions.filter(t => t.category === "PLATFORM" && t.type === "DEBIT" && new Date(t.createdAt).getMonth() === currentMonth && new Date(t.createdAt).getFullYear() === currentYear).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const revLastMonth = transactions.filter(t => t.category === "PLATFORM" && t.type === "DEBIT" && new Date(t.createdAt).getMonth() === lastMonth && new Date(t.createdAt).getFullYear() === lastMonthYear).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const revGrowth = revLastMonth === 0 ? (revThisMonth > 0 ? 100 : 0) : ((revThisMonth - revLastMonth) / revLastMonth) * 100;

  const gmvThisMonth = transactions.filter(t => t.category === "USER" && new Date(t.createdAt).getMonth() === currentMonth && new Date(t.createdAt).getFullYear() === currentYear).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const gmvLastMonth = transactions.filter(t => t.category === "USER" && new Date(t.createdAt).getMonth() === lastMonth && new Date(t.createdAt).getFullYear() === lastMonthYear).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const gmvGrowth = gmvLastMonth === 0 ? (gmvThisMonth > 0 ? 100 : 0) : ((gmvThisMonth - gmvLastMonth) / gmvLastMonth) * 100;

  const usersThisMonth = new Set(transactions.filter(t => new Date(t.createdAt).getMonth() === currentMonth && new Date(t.createdAt).getFullYear() === currentYear).map(t => t.userId)).size;
  const usersLastMonth = new Set(transactions.filter(t => new Date(t.createdAt).getMonth() === lastMonth && new Date(t.createdAt).getFullYear() === lastMonthYear).map(t => t.userId)).size;
  const usersGrowth = usersLastMonth === 0 ? (usersThisMonth > 0 ? 100 : 0) : ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

  const activePayingUsers = new Set(transactions.map(t => t.userId)).size;

  const revByDate = transactions
    .filter(t => t.category === "PLATFORM")
    .reduce((acc: any, t) => {
      const date = new Date(t.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + Number(t.amount);
      return acc;
    }, {});
  const lineChartData = Object.keys(revByDate).reverse().map(date => ({ date, revenue: revByDate[date] }));

  const volByDate = transactions
    .filter(t => t.category === "USER")
    .reduce((acc: any, t) => {
      const date = new Date(t.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + Number(t.amount);
      return acc;
    }, {});
  const barChartData = Object.keys(volByDate).reverse().map(date => ({ date, volume: volByDate[date], revenue: revByDate[date] || 0 }));

  const breakdown = transactions
    .filter(t => t.category === "PLATFORM")
    .reduce((acc: any, t) => {
      const action = t.action || "OTHER_FEE";
      acc[action] = (acc[action] || 0) + Number(t.amount);
      return acc;
    }, {});
  const pieData = Object.keys(breakdown).map(key => ({ name: key, value: breakdown[key] }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
         <Activity className="h-8 w-8 animate-pulse text-indigo-500 mb-4" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } },
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    if (value > 0) return (
      <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
        <ArrowUpRight className="w-3 h-3 mr-1" />{value.toFixed(1)}%
      </span>
    );
    if (value < 0) return (
      <span className="flex items-center text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md">
        <ArrowDownRight className="w-3 h-3 mr-1" />{Math.abs(value).toFixed(1)}%
      </span>
    );
    return (
      <span className="flex items-center text-xs font-semibold text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-md">
        <Minus className="w-3 h-3 mr-1" />0.0%
      </span>
    );
  };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <AdminPageHeader title="Phân tích tài chính" subtitle="Thống kê doanh thu nền tảng và tổng khối lượng giao dịch (GMV) theo thời gian thực." />
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-800/40 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-xl shadow-black/50 transition-all duration-300 hover:bg-[#0A0A0C] hover:-translate-y-1 group">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">Tổng doanh thu</p>
              <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{totalRevenue.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-2">
                <GrowthBadge value={revGrowth} />
                <span className="text-xs text-zinc-500">so với tháng trước</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 shadow-inner">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-800/40 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-xl shadow-black/50 transition-all duration-300 hover:bg-[#0A0A0C] hover:-translate-y-1 group">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">Doanh thu tháng này</p>
              <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{revThisMonth.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-2">
                <GrowthBadge value={revGrowth} />
                <span className="text-xs text-zinc-500">tăng trưởng (MoM)</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 shadow-inner">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-800/40 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-xl shadow-black/50 transition-all duration-300 hover:bg-[#0A0A0C] hover:-translate-y-1 group">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">Tổng giao dịch (GMV)</p>
              <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{gmv.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-2">
                <GrowthBadge value={gmvGrowth} />
                <span className="text-xs text-zinc-500">so với tháng trước</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 shadow-inner">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-800/40 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-xl shadow-black/50 transition-all duration-300 hover:bg-[#0A0A0C] hover:-translate-y-1 group">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">Người dùng trả phí</p>
              <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{activePayingUsers}</p>
              <div className="mt-3 flex items-center gap-2">
                <GrowthBadge value={usersGrowth} />
                <span className="text-xs text-zinc-500">hoạt động tháng này</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[2rem] border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl p-8 shadow-2xl">
           <h3 className="text-lg font-bold text-white mb-6 tracking-wide flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-indigo-400"/> Xu hướng doanh thu
           </h3>
           <div className="h-[320px] w-full">
             {lineChartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                   <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                   <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} dx={-10} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                     itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }} />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-sm text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">Chưa đủ dữ liệu để hiển thị biểu đồ xu hướng</div>
             )}
           </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-[2rem] border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl p-8 shadow-2xl flex flex-col">
           <h3 className="text-lg font-bold text-white mb-6 tracking-wide flex items-center gap-2">
             <PieChart className="w-5 h-5 text-emerald-400"/> Cơ cấu doanh thu
           </h3>
           <div className="flex-1 w-full flex items-center justify-center">
             {pieData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                     itemStyle={{ fontWeight: 'bold' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#a1a1aa' }} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="text-sm text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 w-full h-full flex justify-center items-center">Chưa có dữ liệu cơ cấu doanh thu</div>
             )}
           </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
        <div className="rounded-[2rem] border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl p-8 shadow-2xl">
           <h3 className="text-lg font-bold text-white mb-6 tracking-wide">So sánh Khối lượng Giao dịch (GMV) và Doanh thu</h3>
           <div className="h-[320px] w-full">
             {barChartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                   <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                   <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} dx={-10} />
                   <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} dx={10} />
                   <Tooltip 
                     cursor={{ fill: '#27272a', opacity: 0.4 }} 
                     contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                   />
                   <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingBottom: '20px', fontWeight: '500', color: '#a1a1aa' }} />
                   <Bar yAxisId="left" dataKey="volume" name="Tổng giao dịch (GMV)" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                   <Bar yAxisId="right" dataKey="revenue" name="Doanh thu nền tảng" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
                 <div className="flex h-full items-center justify-center text-sm text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">Chưa đủ dữ liệu để hiển thị biểu đồ so sánh</div>
             )}
           </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-[2rem] border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-6 tracking-wide">Lịch sử giao dịch gần đây</h3>
        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50 shadow-inner">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Người dùng</th>
                <th className="px-5 py-4">Phân loại</th>
                <th className="px-5 py-4">Hoạt động</th>
                <th className="px-5 py-4 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {transactions.slice(0, 10).map((t) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.3 }}
                  key={t.id} 
                  className="hover:bg-zinc-800/40 transition-colors group"
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-zinc-200">{t.user?.name || "Hệ thống"}</p>
                    <p className="text-[11px] text-zinc-500">{t.user?.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-widest uppercase ${
                        t.category === 'PLATFORM' ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' : 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20'
                     }`}>
                        {t.category === 'PLATFORM' ? 'NỀN TẢNG' : 'NGƯỜI DÙNG'}
                     </span>
                  </td>
                  <td className="px-5 py-3.5">
                     <span className="font-medium text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md text-[11px] uppercase tracking-wider">{t.action || "KHÁC"}</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-right text-zinc-200">
                     <span className={t.type === 'CREDIT' ? 'text-emerald-400' : 'text-zinc-200'}>
                        {t.type === 'CREDIT' ? '+' : ''}{Number(t.amount).toLocaleString()} VNĐ
                     </span>
                  </td>
                </motion.tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-500">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  Network, 
  Users, 
  Briefcase, 
  Trophy,
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Target,
  Sparkles
} from "lucide-react";

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 bg-white border-b border-slate-200 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
        
        <Container className="relative relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 font-bold text-[13px] tracking-wide mb-6 border border-sky-100">
              <Sparkles className="w-4 h-4" />
              Nền tảng Tuyển dụng Hiện đại
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[64px] font-black text-slate-900 tracking-tight leading-[1.15] mb-6"
          >
            Nơi sinh viên bắt đầu<br className="hidden sm:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600"> sự nghiệp tự do</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Chúng tôi giúp các bạn trẻ xây dựng hồ sơ năng lực thực chiến, đồng thời bẻ khóa bài toán nhân sự linh hoạt, tối ưu chi phí cho các Startup và SME.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/jobs">
              <Button className="h-14 px-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-[16px] shadow-lg shadow-sky-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                Khám phá công việc <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost" className="h-14 px-8 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-[16px] hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto">
                Đăng ký tài khoản
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>

      {/* 2. ABOUT PLATFORM */}
      <section className="py-20 lg:py-28">
        <Container>
          <motion.div 
            initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-black text-slate-900 mb-4">Hơn cả một chợ việc làm</motion.h2>
            <motion.p variants={fadeInUp} className="text-[17px] text-slate-600 leading-relaxed">
              JobFinder là một bệ phóng sự nghiệp. Chúng tôi trao quyền để sinh viên tiếp cận trực tiếp các dự án từ doanh nghiệp thật, kiếm thu nhập ngay trên ghế nhà trường và tích lũy những kinh nghiệm "thực chiến" không thể tìm thấy trong sách vở.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* 3. VISION & MISSION */}
      <section className="py-20 bg-white border-y border-slate-200">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="rounded-[32px] bg-slate-50 p-8 lg:p-12 border border-slate-100"
            >
               <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-6">
                 <Target className="w-7 h-7 text-sky-600" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4">Tầm nhìn (Vision)</h3>
               <p className="text-[16px] text-slate-600 leading-relaxed">
                 Tái định hình cách thế hệ Gen Z bước vào thế giới việc làm tự do. Chúng tôi tin rằng kinh nghiệm thực chiến phải dành cho tất cả mọi người, không bị giới hạn bởi tuổi tác hay bằng cấp học thuật.
               </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="rounded-[32px] bg-sky-600 p-8 lg:p-12 shadow-xl shadow-sky-600/20 text-white"
            >
               <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                 <Sparkles className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-2xl font-black mb-4">Sứ mệnh (Mission)</h3>
               <p className="text-[16px] text-sky-50 leading-relaxed">
                 Xóa bỏ sự bất tương xứng giữa đào tạo đại học và nhu cầu thực tế. Bằng cơ chế thanh toán bảo vệ (Escrow) và hệ thống đánh giá minh bạch, chúng tôi tạo ra một môi trường "làm việc - thuê việc" tuyệt đối an toàn, tin cậy.
               </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 4. CORE VALUES */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Giá trị cốt lõi</h2>
            <p className="text-[17px] text-slate-500">4 trụ cột quan trọng tạo nên sự khác biệt của JobFinder</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Minh bạch", desc: "Báo giá rõ ràng, thanh toán bảo hộ 100%. Không mập mờ, không lo mất tiền." },
              { icon: Scale, title: "Công bằng", desc: "Thuật toán hiển thị ưu tiên người có năng lực thật sự, bất kể bạn học trường nào." },
              { icon: TrendingUp, title: "Thực chiến", desc: "Mỗi dự án hoàn thành là một 'huy hiệu' tự hào đưa thẳng vào Portfolio của bạn." },
              { icon: Network, title: "Kết nối", desc: "Rút ngắn tối đa khoảng cách giữa giảng đường đại học và yêu cầu doanh nghiệp." }
            ].map((val, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-5 border border-slate-100">
                  <val.icon className="w-6 h-6 text-slate-700" />
                </div>
                <h4 className="text-[18px] font-bold text-slate-900 mb-3">{val.title}</h4>
                <p className="text-[15px] text-slate-500 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-20 lg:py-28 bg-white border-y border-slate-200">
        <Container>
           <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Cách thức hoạt động</h2>
            <p className="text-[17px] text-slate-500">Quy trình làm việc 3 bước đơn giản, thuận tiện cho cả Doanh nghiệp và Freelancer</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
             {/* Path line connecting steps for md+ screens */}
             <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-dashed border-t-2 border-slate-200 border-dashed z-0"></div>
             
             {[
               { icon: FileText, title: "1. Lên bài toán", desc: "Khách hàng mô tả chi tiết yêu cầu dự án và thiết lập ngân sách kỳ vọng." },
               { icon: Users, title: "2. Pitch & Match", desc: "Sinh viên gửi báo giá, thể hiện kỹ năng và lý do mình là người phù hợp nhất." },
               { icon: CreditCard, title: "3. Chốt deal & Nhận tiền", desc: "Làm việc qua hệ thống Milestone. Tiền được giữ an toàn và giải ngân ngay khi xong việc." }
             ].map((step, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: i * 0.2 }}
                 className="relative z-10 flex flex-col items-center text-center"
               >
                 <div className="w-20 h-20 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center mb-6">
                   <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                     <step.icon className="w-6 h-6" />
                   </div>
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                 <p className="text-[15px] text-slate-500 max-w-sm">{step.desc}</p>
               </motion.div>
             ))}
          </div>
        </Container>
      </section>

      {/* 6. WHY CHOOSE US & STATISTICS */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
                Sinh ra dành riêng<br />cho Gen Z
              </h2>
              <p className="text-[17px] text-slate-500 mb-8 leading-relaxed max-w-lg">
                Chúng tôi không giành giật từng job rẻ mạt trên các chợ truyền thống. JobFinder cạnh tranh bằng cơ chế bảo vệ trải nghiệm và định hình lại văn hóa làm việc số.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Leaderboard theo Quý", desc: "Tôn vinh và cấp nhãn đặc quyền cho Top Freelancer, biến nỗ lực thành huy hiệu danh giá thu hút client." },
                  { title: "Đánh giá chéo 2 chiều", desc: "Quyền lực không chỉ nằm ở người thuê. Bạn hoàn toàn có quyền review ngược lại khách hàng để cảnh báo cho cộng đồng." },
                  { title: "Quy trình chuẩn Agency", desc: "Công cụ quản lý tiến độ (Milestone) xịn sò, ép sinh viên làm quen với luồng công việc chuyên nghiệp ngay từ đầu." }
                ].map((ft, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                      <h4 className="text-[17px] font-bold text-slate-900 mb-1">{ft.title}</h4>
                      <p className="text-[15px] text-slate-500 leading-relaxed">{ft.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full"
            >
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-2 sm:col-span-1 rounded-[32px] bg-slate-900 p-8 text-white flex flex-col justify-center">
                  <Briefcase className="w-8 h-8 text-sky-400 mb-4" />
                  <p className="text-4xl font-black mb-2">5,000+</p>
                  <p className="text-slate-400 font-medium">Dự án hoàn thành</p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-[32px] bg-sky-50 border border-sky-100 p-8 flex flex-col justify-center">
                  <Users className="w-8 h-8 text-sky-600 mb-4" />
                  <p className="text-4xl font-black text-slate-900 mb-2">12,000+</p>
                  <p className="text-slate-600 font-medium">Freelancer tham gia</p>
                </div>
                <div className="col-span-2 rounded-[32px] bg-white border border-slate-200 shadow-sm p-8 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-between gap-6 text-center sm:text-left">
                  <div>
                    <Trophy className="w-8 h-8 text-amber-500 mb-4 mx-auto sm:mx-0" />
                    <p className="text-4xl font-black text-slate-900 mb-2">98%</p>
                    <p className="text-slate-500 font-medium">Khách hàng hài lòng & quay lại</p>
                  </div>
                  <div className="hidden sm:block w-px h-24 bg-slate-100"></div>
                  <div>
                    <p className="text-slate-900 font-bold mb-2">Được vinh danh bởi:</p>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xl text-slate-300">STARTUP</span>
                      <span className="font-black text-xl text-slate-300">VIETNAM</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </Container>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-24 bg-slate-900 text-center px-4">
        <Container>
          <motion.div 
             initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
             className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Sẵn sàng để <span className="text-sky-400">bứt phá?</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Đừng đợi đến khi tốt nghiệp mới bắt đầu tìm việc. Hãy xây dựng tương lai, mài giũa kỹ năng thực chiến và tạo dựng uy tín của bạn ngay từ hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/jobs">
                <Button className="h-14 px-10 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-[16px] transition-colors w-full sm:w-auto shadow-lg shadow-sky-500/20">
                  Tìm việc freelance
                </Button>
              </Link>
              <Link href="/client/jobs/create">
                <Button variant="ghost" className="h-14 px-10 rounded-full border-2 border-slate-700 hover:border-slate-600 bg-transparent text-white font-bold text-[16px] hover:bg-slate-800 transition-colors w-full sm:w-auto">
                  Đăng dự án mới
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}

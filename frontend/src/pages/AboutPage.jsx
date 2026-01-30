import React from 'react';
import { 
  Activity, ShieldCheck, Database, BarChart3, 
  MapPin, Mail, Phone, Globe, CloudRain, MonitorPlay
} from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: <MonitorPlay className="w-6 h-6" />,
      title: "Interactive Video Map",
      desc: "นวัตกรรมแผนที่แสดงผลแบบเคลื่อนไหว (Video Background) แสดงพิกัดเขื่อนและอ่างเก็บน้ำสำคัญ พร้อมจุดตรวจวัดน้ำแบบ Real-time"
    },
    {
      icon: <CloudRain className="w-6 h-6" />,
      title: "Rainfall Monitoring",
      desc: "ระบบติดตามปริมาณน้ำฝนครอบคลุม 13 อำเภอทั่วลำปาง แจ้งเตือนพื้นที่วิกฤตด้วย Color-coded Indicator"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Management Dashboard",
      desc: "สรุปสถานการณ์น้ำ (Inflow/Outflow) และ % ความจุ ผ่านกราฟและตารางที่รองรับการออกรายงาน (PDF Export)"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-12 animate-fade-in mb-10">
      
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-br from-cyan-900 via-blue-800 to-teal-700 rounded-3xl p-12 text-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden border border-white/10">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="z-10">
          <div className="bg-white/10 p-4 rounded-2xl inline-block mb-6 backdrop-blur-md shadow-lg border border-white/20">
            <Activity className="w-12 h-12 text-cyan-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Lampang Smart Water
          </h1>
          <p className="text-lg md:text-2xl text-cyan-100 max-w-3xl mx-auto font-light leading-relaxed">
            ระบบบริหารจัดการน้ำอัจฉริยะจังหวัดลำปาง เชื่อมโยงข้อมูลเขื่อน ฝน และระดับน้ำ เพื่อการตัดสินใจที่แม่นยำ
          </p>
        </div>
      </div>

      {/* --- Features Grid --- */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-cyan-50 w-14 h-14 rounded-xl flex items-center justify-center text-cyan-700 mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-colors shadow-sm">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* --- Mission & Tech Stack --- */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 flex flex-col lg:flex-row items-center gap-12 shadow-sm">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold text-slate-800 border-l-4 border-cyan-600 pl-4">
            ภารกิจของเรา (Our Mission)
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            เราพัฒนาระบบนี้เพื่อยกระดับการบริหารจัดการน้ำในจังหวัดลำปาง โดยเน้นการรวบรวมข้อมูลจากแหล่งต่างๆ ทั้งปริมาณน้ำในเขื่อน (เช่น เขื่อนกิ่วลม, เขื่อนกิ่วคอหมา) และข้อมูลน้ำฝนรายอำเภอ มาแสดงผลในรูปแบบที่เข้าใจง่าย (Visualization) เพื่อให้เจ้าหน้าที่และผู้บริหารสามารถวางแผนบริหารจัดการน้ำได้อย่างมีประสิทธิภาพสูงสุด
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2 text-slate-700 font-medium bg-slate-50 p-3 rounded-lg">
              <ShieldCheck className="text-green-500 w-5 h-5" />
              <span>ข้อมูลผ่านการตรวจสอบ (Verify)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 font-medium bg-slate-50 p-3 rounded-lg">
              <Database className="text-blue-500 w-5 h-5" />
              <span>ฐานข้อมูล Real-time MySQL</span>
            </div>
          </div>
        </div>
        
        {/* Image / Graphic Area */}
        <div className="flex-shrink-0 w-full lg:w-[400px] h-64 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden group">
            {/* ใส่รูป Dam หรือ Map จริงๆ ตรงนี้ได้ */}
            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-all"></div>
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400" 
              alt="Water Management" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
            />
            <div className="z-10 text-center p-4">
               <h3 className="text-slate-800 font-bold text-xl">Technology Stack</h3>
               <p className="text-slate-600 text-sm mt-2">React + Vite + Tailwind</p>
               <p className="text-slate-600 text-sm">Node.js + MySQL</p>
            </div>
        </div>
      </div>

      {/* --- Contact Section --- */}
      <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">ติดต่อสอบถาม (Contact Us)</h2>
            <p className="text-cyan-200/80 mt-2">ศูนย์ข้อมูลสารสนเทศทรัพยากรน้ำ จังหวัดลำปาง</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <ContactItem 
              icon={MapPin} 
              title="ที่ตั้งสำนักงาน" 
              detail="ศาลากลางจังหวัดลำปาง, อ.เมืองลำปาง" 
            />
            <ContactItem 
              icon={Phone} 
              title="โทรศัพท์" 
              detail="054-XXX-XXX" 
            />
            <ContactItem 
              icon={Mail} 
              title="อีเมล" 
              detail="lampang.water@dwr.go.th" 
            />
            <ContactItem 
              icon={Globe} 
              title="เว็บไซต์" 
              detail="www.lampang-water.go.th" 
            />
          </div>
        </div>
      </div>

    </div>
  );
};

// Sub-component เพื่อลดโค้ดซ้ำ
const ContactItem = ({ icon: Icon, title, detail }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-sm">
    <div className="bg-white/10 p-3 rounded-full mb-4">
      <Icon className="text-cyan-400 w-6 h-6" />
    </div>
    <div className="text-sm space-y-1">
      <p className="text-gray-400 font-medium">{title}</p>
      <p className="font-semibold text-white">{detail}</p>
    </div>
  </div>
);

export default AboutPage;
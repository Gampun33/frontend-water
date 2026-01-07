import React from 'react';
import { 
  Activity, ShieldCheck, Database, BarChart3, 
  MapPin, Mail, Phone, Globe 
} from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Real-time MySQL",
      desc: "จัดเก็บข้อมูลระดับน้ำและปริมาณน้ำไหลเข้า-ออกอย่างแม่นยำด้วยฐานข้อมูล MySQL"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Data Visualization",
      desc: "วิเคราะห์สถานการณ์น้ำผ่านแผนที่ Interactive และกราฟสรุปผลที่เข้าใจง่าย"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Security & Verification",
      desc: "ระบบตรวจสอบข้อมูลโดย Admin ก่อนเผยแพร่ เพื่อความถูกต้องของข้อมูลสาธารณะ"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-12 animate-fade-in mb-10">
      
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-3xl p-12 text-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="z-10">
          <div className="bg-white/20 p-5 rounded-full inline-block mb-6 backdrop-blur-md shadow-lg border border-white/30">
            <Activity className="w-12 h-12 text-blue-200" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">About HydroMonitor</h1>
          <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            ก้าวสู่การบริหารจัดการทรัพยากรน้ำแห่งอนาคต ด้วยระบบติดตามสถานการณ์อัจฉริยะแบบ Real-time
          </p>
        </div>
      </div>

      {/* --- Features Grid --- */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
            <p className="text-gray-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* --- Mission & Vision --- */}
      <div className="bg-white rounded-3xl p-10 border border-blue-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-blue-900">เป้าหมายของระบบ (Mission)</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            เรามุ่งมั่นสร้างเครื่องมือที่ช่วยให้เจ้าหน้าที่สามารถบันทึกและตรวจสอบข้อมูลน้ำได้อย่างรวดเร็ว 
            เพื่อส่งต่อข้อมูลที่ถูกต้องไปยังประชาชนและผู้ที่เกี่ยวข้อง ช่วยในการตัดสินใจและป้องกันภัยพิบัติได้อย่างมีประสิทธิภาพ
          </p>
          <ul className="space-y-2">
            {['ความแม่นยำของข้อมูล', 'ความรวดเร็วในการรายงาน', 'ความโปร่งใสตรวจสอบได้'].map((text, i) => (
              <li key={i} className="flex items-center text-blue-700 font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-shrink-0 w-full md:w-80 h-48 bg-blue-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-blue-200">
           <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-2xl opacity-80" alt="Technology" />
        </div>
      </div>

      {/* --- Contact Section --- */}
      <div className="bg-gray-900 rounded-3xl p-10 text-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">ติดต่อเรา (Contact Us)</h2>
          <p className="text-gray-400 mt-2">ศูนย์บริหารจัดการน้ำอัจฉริยะ กรมชลประทาน</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <MapPin className="text-blue-400 w-6 h-6" />
            <div className="text-sm">
              <p className="text-gray-400">สถานที่ตั้ง</p>
              <p className="font-medium">กรุงเทพมหานคร, ไทย</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <Phone className="text-blue-400 w-6 h-6" />
            <div className="text-sm">
              <p className="text-gray-400">โทรศัพท์</p>
              <p className="font-medium">02-XXX-XXXX</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <Mail className="text-blue-400 w-6 h-6" />
            <div className="text-sm">
              <p className="text-gray-400">อีเมล</p>
              <p className="font-medium">contact@hydro.go.th</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <Globe className="text-blue-400 w-6 h-6" />
            <div className="text-sm">
              <p className="text-gray-400">เว็บไซต์</p>
              <p className="font-medium">www.hydro.go.th</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
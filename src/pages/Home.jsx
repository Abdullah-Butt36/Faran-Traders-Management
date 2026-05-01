import { useState } from 'react';

function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-20 md:space-y-32 pb-20 md:pb-32">
      {/* 1. Hero Section */}
      <section className="pt-16 md:pt-24 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="floating mb-6 md:mb-10 inline-block">
            <span className="px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] md:text-sm font-bold text-indigo-600 uppercase tracking-widest">
              ✨ Modern Business Management
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-heading font-black tracking-tighter mb-6 md:mb-10 text-slate-900 leading-[1.1]">
            Smart Trading <br className="hidden sm:block" />
            <span className="text-gradient">Simplified.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto mb-10 md:mb-16 leading-relaxed px-4">
            From inventory tracking to real-time financial reporting, Faran Traders provides the tools you need to stay ahead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-indigo-700 transition-all hover:shadow-2xl hover:shadow-indigo-200" onClick={() => setCount(c => c + 1)}>
              Explore Dashboard ({count})
            </button>
            <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-slate-50 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* 2. Stats Overview Section */}
      <section className="px-6 bg-slate-50/50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { label: "Receivable", val: "₨ 1.2M", icon: "📈", color: "indigo" },
            { label: "Payable", val: "₨ 450K", icon: "📉", color: "rose" },
            { label: "Cash Flow", val: "₨ 890K", icon: "💰", color: "emerald" },
            { label: "Total Stock", val: "1.4K", icon: "📦", color: "amber" }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 md:p-10 flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm border border-slate-50">{stat.icon}</div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-heading font-black text-slate-900">{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Why Choose Us (Benefits) Section */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-6xl font-heading font-black text-slate-900 mb-4 md:mb-6 leading-tight">Why Faran Traders?</h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">The gold standard for local trading and inventory management.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[
            { title: "Blazing Fast", desc: "React-powered UI for zero-latency operations.", icon: "⚡" },
            { title: "Security", desc: "Enterprise-grade data protection for your records.", icon: "🛡️" },
            { title: "24/7 Sync", desc: "Real-time updates across all your devices.", icon: "🔄" }
          ].map((b, i) => (
            <div key={i} className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all group">
              <div className="text-4xl md:text-5xl mb-6 md:mb-8 group-hover:scale-110 transition-transform inline-block">{b.icon}</div>
              <h4 className="text-xl md:text-2xl font-heading font-bold mb-3 md:mb-4">{b.title}</h4>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Core Modules Preview Section */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="space-y-6 md:space-y-8 text-center lg:text-left">
          <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight">Manage Everything in One Place</h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            No more switching between spreadsheets. Faran Traders integrates every aspect of your business into a single, intuitive interface.
          </p>
          <div className="space-y-3 inline-block text-left mx-auto lg:mx-0">
            {["Customer Ledgers", "Stock Monitoring", "Sales Invoicing", "Expense Tracking"].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-700 font-bold text-sm md:text-base">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px]">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card aspect-video flex items-center justify-center bg-indigo-600 text-white text-6xl md:text-8xl shadow-2xl shadow-indigo-200 rounded-[32px]">
          📊
        </div>
      </section>

      {/* 5. Trust & Testimonials Section */}
      <section className="px-6 bg-slate-900 py-20 md:py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-indigo-600/20 blur-[120px]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-black mb-12 md:mb-16 leading-tight">Trusted by Local Traders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[24px] md:rounded-[32px] backdrop-blur-md">
                <div className="flex justify-center gap-1 text-amber-400 mb-6">{"★".repeat(5)}</div>
                <p className="text-slate-300 italic mb-6 md:mb-8 text-sm md:text-base">"Since switching to Faran Traders, our stock errors have dropped by 90%."</p>
                <p className="font-bold text-white tracking-widest uppercase text-[10px] md:text-xs">— Business Owner {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto p-10 md:p-24 text-center bg-slate-900 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-600/20 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-purple-600/10 blur-[100px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-heading font-black text-white mb-6 md:mb-8 leading-tight">Ready to Scale Your Business?</h2>
            <p className="text-slate-400 text-lg md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto">Join hundreds of traders who are already managing their business smarter with Faran Traders.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 md:px-12 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
                Get Started Now
              </button>
              <button className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-10 py-4 md:px-12 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-white/20 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

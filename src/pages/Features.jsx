function Features() {
  return (
    <div className="space-y-20 md:space-y-32 pb-20 md:pb-32">
      {/* 1. Feature Hero */}
      <section className="pt-16 md:pt-24 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-heading font-black text-slate-900 mb-6 md:mb-8 leading-tight">
            Comprehensive <br /> <span className="text-gradient">Feature Suite</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto px-4">
            Explore the powerful modules that make Faran Traders the most versatile management system.
          </p>
        </div>
      </section>

      {/* 2. Management Features Section */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="glass-card p-8 md:p-12 bg-blue-50/30 border-blue-100 group">
          <div className="text-4xl md:text-5xl mb-6 md:mb-8 group-hover:scale-110 transition-transform inline-block">📦</div>
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-4 md:mb-6">Smart Inventory</h3>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6">Real-time tracking of every item. Automated low-stock alerts ensure you never miss a sale.</p>
          <ul className="space-y-3 text-slate-700 font-medium text-sm md:text-base">
            <li className="flex items-center gap-2"><span className="text-blue-500">•</span> Category-wise Organization</li>
            <li className="flex items-center gap-2"><span className="text-blue-500">•</span> Barcode Integration Support</li>
            <li className="flex items-center gap-2"><span className="text-blue-500">•</span> Instant Stock Reconciliation</li>
          </ul>
        </div>
        <div className="glass-card p-8 md:p-12 bg-rose-50/30 border-rose-100 group">
          <div className="text-4xl md:text-5xl mb-6 md:mb-8 group-hover:scale-110 transition-transform inline-block">👥</div>
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-4 md:mb-6">Party Management</h3>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6">Manage thousands of customers and suppliers with ease. Complete history at your fingertips.</p>
          <ul className="space-y-3 text-slate-700 font-medium text-sm md:text-base">
            <li className="flex items-center gap-2"><span className="text-rose-500">•</span> Detailed Customer Ledgers</li>
            <li className="flex items-center gap-2"><span className="text-rose-500">•</span> Supplier Payment Tracking</li>
            <li className="flex items-center gap-2"><span className="text-rose-500">•</span> City-wise Data Filtering</li>
          </ul>
        </div>
      </section>

      {/* 3. Financial Features Section */}
      <section className="px-6 bg-slate-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-12 md:mb-16 leading-tight px-4">Advanced Financial Core</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: "Invoicing", desc: "Professional multi-item invoices.", icon: "🧾" },
              { title: "Profit/Loss", desc: "Automated business performance.", icon: "📉" },
              { title: "Expense Tracking", desc: "Manage operational costs.", icon: "💸" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-6">{f.icon}</div>
                <h4 className="text-xl font-bold mb-3 md:mb-4">{f.title}</h4>
                <p className="text-slate-500 text-sm md:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Security & Access Section */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="text-6xl md:text-7xl text-center lg:text-left order-2 lg:order-1">🔐</div>
        <div className="order-1 lg:order-2 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-6 md:mb-8 leading-tight">Enterprise-Grade Security</h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8">
            Your business data is sensitive. We use the latest encryption and session management to keep it safe.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left">
            <div className="p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold mb-2 text-sm md:text-base">Bcrypt Hashing</h4>
              <p className="text-[12px] md:text-sm text-slate-400">Secure passwords always.</p>
            </div>
            <div className="p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold mb-2 text-sm md:text-base">Session Mgmt</h4>
              <p className="text-[12px] md:text-sm text-slate-400">Timed access control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Export & Reporting Section */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="p-10 md:p-24 bg-indigo-50 rounded-[32px] md:rounded-[48px] border border-indigo-100 text-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 blur-3xl"></div>
          <div className="relative z-10 px-4">
            <div className="text-5xl md:text-6xl mb-6 md:mb-8">📄</div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mb-4 md:mb-6 leading-tight">One-Click PDF Reports</h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Export any ledger, invoice, or financial report to professional PDF format with one click. Ready for printing or sharing.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Mobile & Cloud Support Section */}
      <section className="px-6 max-w-7xl mx-auto py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-12 md:mb-16 leading-tight px-4">Run Your Business from Anywhere</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-20 items-center">
          <div className="text-slate-400 flex flex-col items-center gap-4 group">
            <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">📱</div>
            <span className="font-bold text-sm md:text-base">Mobile Responsive</span>
          </div>
          <div className="text-slate-400 flex flex-col items-center gap-4 group">
            <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">☁️</div>
            <span className="font-bold text-sm md:text-base">Cloud Ready</span>
          </div>
          <div className="text-slate-400 flex flex-col items-center gap-4 group">
            <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">⚡</div>
            <span className="font-bold text-sm md:text-base">Lightning Performance</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;

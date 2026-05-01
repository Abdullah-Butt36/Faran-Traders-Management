function About() {
  return (
    <div className="space-y-20 md:space-y-32 pb-20 md:pb-32">
      {/* 1. About Hero */}
      <section className="pt-16 md:pt-24 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-heading font-black text-slate-900 mb-6 md:mb-8 leading-tight">
            Our Story & <br /> <span className="text-gradient">Core Vision</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto px-4">
            Discover how Faran Traders transformed from a local PHP project into a high-performance business ecosystem.
          </p>
        </div>
      </section>

      {/* 2. Our Journey Section */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="aspect-video bg-indigo-50 rounded-[32px] md:rounded-[40px] flex items-center justify-center text-7xl md:text-9xl floating shadow-inner">🚀</div>
        </div>
        <div className="order-1 lg:order-2 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-6 md:mb-8 leading-tight">From PHP to React</h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6">
            In 2025, Faran Traders started as a custom PHP solution to manage complex trade operations. As the business grew, so did the need for speed and interactivity.
          </p>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            Today, we've migrated to a modern React stack, ensuring that our users have the most responsive and powerful interface available in the market.
          </p>
        </div>
      </section>

      {/* 3. Core Values Section */}
      <section className="px-6 bg-slate-900 py-20 md:py-32 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-12 md:mb-16 text-white leading-tight">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {[
              { title: "Transparency", desc: "Every rupee is tracked with precision.", icon: "💎" },
              { title: "Innovation", desc: "Constant updates and new features.", icon: "💡" },
              { title: "Trust", desc: "Reliable data you can bet your business on.", icon: "🤝" }
            ].map((v, i) => (
              <div key={i} className="space-y-4 md:space-y-6">
                <div className="text-4xl md:text-5xl">{v.icon}</div>
                <h4 className="text-xl md:text-2xl font-bold">{v.title}</h4>
                <p className="text-slate-400 text-sm md:text-base">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tech Stack Section */}
      <section className="px-6 max-w-7xl mx-auto py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-12 md:mb-16 leading-tight">Our Modern Stack</h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12 px-4">
          {["React 19", "Vite", "Tailwind CSS", "MySQL", "PHP 8", "Chart.js"].map((tech, i) => (
            <div key={i} className="px-6 py-3 md:px-8 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-600 text-sm md:text-base hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default">
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Team & Culture Section */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-6 md:mb-8 leading-tight">Support Culture</h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8">
            We don't just provide software; we provide a partnership. Our support team is always ready to help you optimize your business operations.
          </p>
          <button className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg">
            Connect with Support
          </button>
        </div>
        <div className="glass-card p-10 md:p-12 bg-emerald-50 border-emerald-100 flex items-center justify-center text-7xl md:text-9xl rounded-[32px] md:rounded-[40px]">
          🎧
        </div>
      </section>

      {/* 6. Future Vision Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center p-10 md:p-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[32px] md:rounded-[48px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-heading font-black mb-6 md:mb-8 leading-[1.1]">Scale Without Limits</h2>
            <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
              Our vision for 2026 includes AI-powered stock prediction and global supply chain integrations.
            </p>
            <div className="text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase opacity-60">Building the future of Trade</div>
          </div>
        </div>
      </section>
    </div>
  
  );
}

export default About;

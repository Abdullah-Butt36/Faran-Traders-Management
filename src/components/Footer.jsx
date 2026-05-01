function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-400 text-sm font-medium">
          &copy; 2026 Faran Traders. All rights reserved.
        </p>
        <div className="flex gap-8 text-slate-400 text-sm font-medium">
          <a href="#" className="hover:text-slate-900 transition-colors no-underline">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors no-underline">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors no-underline">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

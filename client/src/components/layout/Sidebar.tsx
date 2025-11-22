export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 fixed left-[max(0px,calc(50%-40rem))] top-16 h-[calc(100vh-4rem)] border-r border-zinc-800 bg-zinc-950/50 p-6 overflow-y-auto">
      <nav className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Feeds
          </h3>
          <div className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-zinc-800/50 rounded-md">
              <span>🏠</span> Home
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors">
              <span>🔥</span> Popular
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Minhas Comunidades
          </h3>
          <div className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition-colors">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> r/reactjs
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition-colors">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span> p/backend
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition-colors">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> g/opensource
            </a>
          </div>
        </div>
      </nav>
    </aside>
  );
}
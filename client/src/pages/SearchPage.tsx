import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { searchService } from "../services/searchService"; 
import { Loader2, User, FolderGit2, SearchX } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || "";
  
  const [results, setResults] = useState<{ users: any[], projects: any[] }>({ users: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function doSearch() {
      if (!query) return;
      setLoading(true);
      try {
        // @ts-ignore
        const data = await searchService.search(query);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    doSearch();
  }, [query]);

  return (
    <AppShell>
      <Sidebar />
      <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full pb-20 px-4">
        
        <h1 className="text-2xl font-bold text-white mb-6">
            Resultados para: <span className="text-violet-400">"{query}"</span>
        </h1>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" size={32}/></div>
        ) : (
            <div className="space-y-8">
                {/* Seção Usuários */}
                <div>
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User size={16}/> Pessoas
                    </h2>
                    {results.users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.users.map((user: any) => (
                                <Link key={user.id} to={`/profile/${user.username}`} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900 transition-all group">
                                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-violet-500 transition-colors"/>
                                    <div className="min-w-0">
                                        <p className="font-bold text-zinc-200 group-hover:text-white truncate">{user.name}</p>
                                        <p className="text-xs text-zinc-500">@{user.username}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-zinc-500 text-sm italic">Nenhum usuário encontrado.</p>}
                </div>

                {/* Seção Projetos */}
                <div>
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FolderGit2 size={16}/> Projetos
                    </h2>
                    {results.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.projects.map((proj: any) => (
                                <Link key={proj.id} to={`/project/${proj.slug}`} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/30">
                                        {proj.avatarUrl ? <img src={proj.avatarUrl} className="w-full h-full object-cover rounded-xl"/> : <span className="font-bold text-zinc-500">{proj.name[0]}</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-zinc-200 group-hover:text-white truncate">{proj.name}</p>
                                        <p className="text-xs text-zinc-500 truncate">{proj.description || "Sem descrição."}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-zinc-500 text-sm italic">Nenhum projeto encontrado.</p>}
                </div>

                {results.users.length === 0 && results.projects.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <SearchX size={48} className="mx-auto mb-4"/>
                        <p>Nada encontrado para sua busca.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </AppShell>
  );
}
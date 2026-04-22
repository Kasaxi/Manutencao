import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-zinc-100 flex-col md:flex-row antialiased">
      {/* 80% Left Side - Typographic Brutalism */}
      <div className="hidden md:flex flex-col justify-end p-12 w-full md:w-[75%] lg:w-[80%] bg-[#111113] border-r border-zinc-800 relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
         <div className="z-10 flex flex-col h-full justify-between">
           <div className="text-xl font-bold tracking-widest uppercase text-zinc-600">
             Manutenção.PRO
           </div>
           
           <div>
             <h1 className="text-8xl lg:text-[10rem] font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90 mix-blend-difference selection:bg-[#FF4500] selection:text-white">
               Gerir.<br/>
               Manter.<br/>
               Resolver.
             </h1>
             <p className="mt-8 text-xl font-medium tracking-tight text-zinc-500 max-w-lg">
               O sistema definitivo de controle de manutenção. Sem interfaces genéricas. Execução pura.
             </p>
           </div>
        </div>
      </div>

      {/* 20% Right Side - Authentication Action */}
      <div className="flex flex-col justify-center items-center p-8 w-full md:w-[25%] lg:w-[20%] space-y-8 h-screen relative bg-[#0A0A0B]">
        {/* Subtle decorative geometry */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4500] opacity-10 blur-3xl rounded-full" />
        
        <div className="w-full max-w-sm flex flex-col space-y-6 z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Autenticação</h2>
            <p className="text-sm text-zinc-500">Forneça suas credenciais de acesso.</p>
          </div>

          <form className="flex flex-col space-y-5">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="email">ID do Operador</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="admin@exemplo.com.br"
                  className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors rounded-none placeholder:text-zinc-700 font-mono text-sm text-zinc-100"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="password">Senha de Acesso</label>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••"
                  className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors rounded-none placeholder:text-zinc-700 font-mono text-sm text-zinc-100"
                  required
                />
              </div>
            </div>

            <button 
              formAction={login}
              className="mt-6 w-full bg-zinc-100 text-zinc-950 font-bold uppercase tracking-widest py-3 text-sm hover:bg-[#FF4500] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 duration-200"
            >
              Iniciar Sessão
            </button>
            
            {searchParams?.message && (
              <p className="mt-4 p-3 bg-red-950/50 border border-red-900 text-red-500 text-center text-sm font-mono">
                {searchParams.message}
              </p>
            )}
            
          </form>

          {/* Version */}
          <div className="pt-4 flex justify-between w-full border-t border-zinc-800 mt-8">
             <span className="text-xs font-mono text-zinc-600">v0.1.0-alpha</span>
             <span className="text-xs font-mono text-zinc-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                ATIVO
             </span>
          </div>
        </div>
      </div>
    </div>
  )
}

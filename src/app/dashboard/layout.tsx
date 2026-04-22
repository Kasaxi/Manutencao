import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LogOut } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-zinc-100 font-mono antialiased overflow-hidden">
      <Sidebar userEmail={user.email!} />


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden w-full relative bg-[#0A0A0B]">
         {/* Mobile Header */}
         <div className="lg:hidden p-4 border-b border-zinc-800 flex justify-between items-center bg-[#111113] sticky top-0 z-50">
            <div className="text-xl font-black tracking-tighter uppercase text-zinc-100 flex items-center gap-2">
               <span className="w-3 h-3 bg-[#FF4500] transform rotate-45"></span>
               M_PRO
            </div>
            <form action="/auth/signout" method="post">
               <button className="text-zinc-500 hover:text-[#FF4500]">
                  <LogOut size={20} />
               </button>
            </form>
         </div>
         {children}
      </main>
    </div>
  )
}

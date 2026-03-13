import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

export default function DashboardLayout({ children }) {
  const { t } = useTranslation()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  
  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    window.location.href = '/login';
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar className="glass-panel border-r border-white/5" />
        <SidebarInset className="bg-transparent">
          <header className="flex h-20 shrink-0 items-center justify-between px-6 md:px-10 sticky top-0 z-10 glass-panel border-b border-white/10 shadow-lg">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 hover:bg-primary/10 transition-colors" />
              <Separator orientation="vertical" className="mx-2 h-6 bg-white/10" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                <LanguageToggle />
                <ModeToggle />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLogoutConfirmOpen(true)} 
                className="rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                {t('common.logout')}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_logout') || '¿Cerrar sesión?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.confirm_logout_desc') || '¿Estás seguro de que quieres cerrar sesión?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

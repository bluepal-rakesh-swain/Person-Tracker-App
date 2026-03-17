import * as Toast from '@radix-ui/react-toast'
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import { createContext, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning'
interface ToastItem { id: string; type: ToastType; message: string }

interface ToastCtx { show: (message: string, type?: ToastType) => void }
const Ctx = createContext<ToastCtx>({ show: () => {} })

export function useToast() { return useContext(Ctx) }

const icons = {
  success: <CheckCircle  size={16} className="text-emerald-500 flex-shrink-0" />,
  error:   <XCircle      size={16} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
}
const borders = {
  success: 'border-l-emerald-500',
  error:   'border-l-red-500',
  warning: 'border-l-amber-500',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, type, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id: string) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <Ctx.Provider value={{ show }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <Toast.Root
            key={t.id}
            open
            onOpenChange={open => { if (!open) remove(t.id) }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 border-l-4 ${borders[t.type]} shadow-lg shadow-black/10 min-w-[260px] max-w-sm`}
          >
            {icons[t.type]}
            <Toast.Description className="flex-1 text-sm text-gray-700 dark:text-gray-200 font-medium">
              {t.message}
            </Toast.Description>
            <Toast.Close asChild>
              <button className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={14} />
              </button>
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 outline-none" />
      </Toast.Provider>
    </Ctx.Provider>
  )
}

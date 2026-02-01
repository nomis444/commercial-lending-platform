import PortalNavigation from '@/components/PortalNavigation'

export default function PortalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <PortalNavigation />
      {children}
    </div>
  )
}
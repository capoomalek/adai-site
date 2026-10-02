import { SousNavIpest } from '@/components/ipest/SousNavIpest'

export default function LayoutIpest({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SousNavIpest />
      {children}
    </>
  )
}
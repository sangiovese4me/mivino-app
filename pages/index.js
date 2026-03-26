import dynamic from 'next/dynamic'

const MiVinoApp = dynamic(() => import('../app'), {
  ssr: false,
})

export default function Home() {
  return <MiVinoApp />
}

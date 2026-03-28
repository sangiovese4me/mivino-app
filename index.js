import dynamic from ‘next/dynamic’

const MiVinoApp = dynamic(() => import(’../MiVinoApp’), {
ssr: false,
})

export default function Home() {
return <MiVinoApp />
}

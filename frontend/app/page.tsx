'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/employee')
  }, [router])
  return <div className="min-h-screen bg-gray-50" />
}

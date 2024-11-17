'use client'

import { useState } from 'react'
import GoogleMap from "@/components/GoogleMap"

export default function Driver() {
  
  return (
    <div className="relative h-screen w-full">
      {/* Pass the click handler to GoogleMap */}
      <GoogleMap />
    </div>
  )
}

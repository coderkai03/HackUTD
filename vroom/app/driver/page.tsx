'use client'

import { useState } from 'react'
import GoogleMap from "@/components/GoogleMap"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign } from 'lucide-react'

export default function Driver() {
  const [moneySaved, setMoneySaved] = useState(1.25) // Initial value, you can adjust this as needed

  return (
    <div className="relative h-screen w-full">
      <GoogleMap />
      
      {/* Money Saved Stat */}
      <Card className="absolute top-4 right-4 p-2 bg-green-500 text-white">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-bold">{moneySaved.toFixed(2)}</span>
          <span className="text-sm">saved/gallon</span>
        </div>
      </Card>

      {/* Vroom Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Button 
          variant="default" 
          size="lg"
          className="px-8 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-shadow duration-300"
          onClick={() => setMoneySaved(prev => prev + 0.10)} // Increase money saved on click
        >
          Vroom
        </Button>
      </div>
    </div>
  )
}
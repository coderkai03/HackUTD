"use client"

import { useState } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for Toyota car models
const carData = [
  { rank: 1, model: "Prius Prime", mpg: 45 },
  { rank: 2, model: "Corolla Hybrid", mpg: 42 },
  { rank: 3, model: "Camry Hybrid", mpg: 40 },
  { rank: 4, model: "RAV4 Hybrid", mpg: 38 },
  { rank: 5, model: "Highlander Hybrid", mpg: 35 },
]

export default function ToyotaDashboard() {
  const [maxMpg, setMaxMpg] = useState(49)
  
  // Calculate the overall percentage towards the 2026 goal
  const averageMpg = carData.reduce((sum, car) => sum + car.mpg, 0) / carData.length
  const progressPercentage = (averageMpg / 49) * 100

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Toyota Fuel Economy Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Progress Towards 2026 Goal</CardTitle>
          <CardDescription>Current average MPG vs 49 MPG target</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full" />
          <p className="mt-2 text-center font-semibold">
            {progressPercentage.toFixed(1)}% ({averageMpg.toFixed(1)} MPG)
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Car Model Rankings</CardTitle>
            <CardDescription>Sorted by fuel efficiency (MPG)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>MPG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carData.map((car) => (
                  <TableRow key={car.rank}>
                    <TableCell>{car.rank}</TableCell>
                    <TableCell>{car.model}</TableCell>
                    <TableCell>{car.mpg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Fuel Economy by Model</CardTitle>
            <CardDescription>Comparing MPG across Toyota models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="max-mpg">Max MPG (up to 49)</Label>
              <Input
                id="max-mpg"
                type="number"
                value={maxMpg}
                onChange={(e) => setMaxMpg(Math.min(49, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full max-w-xs"
              />
            </div>
            <ChartContainer
              config={{
                mpg: {
                  label: "MPG",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carData}>
                  <XAxis dataKey="model" />
                  <YAxis domain={[0, maxMpg]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="mpg" fill="var(--color-mpg)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
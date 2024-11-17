"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for car models and brands
const initialCarData = [
  { brand: "Toyota", rank: 1, model: "Prius Prime", mpg: 45 },
  { brand: "Toyota", rank: 2, model: "Corolla Hybrid", mpg: 42 },
  { brand: "Toyota", rank: 3, model: "Camry Hybrid", mpg: 40 },
  { brand: "Toyota", rank: 4, model: "RAV4 Hybrid", mpg: 38 },
  { brand: "Toyota", rank: 5, model: "Highlander Hybrid", mpg: 35 },
  { brand: "Honda", rank: 6, model: "Civic Hybrid", mpg: 43 },
  { brand: "Honda", rank: 7, model: "Accord Hybrid", mpg: 41 },
  { brand: "Ford", rank: 8, model: "Fusion Hybrid", mpg: 38 },
  { brand: "Ford", rank: 9, model: "Escape Hybrid", mpg: 37 },
];

export default function Dashboard() {
  const [carData, setCarData] = useState(initialCarData);
  const [brandData, setBrandData] = useState([]);
  const [maxMpg, setMaxMpg] = useState(49);

  // Calculate the overall percentage towards the 2026 goal
  const averageMpg =
    carData.reduce((sum, car) => sum + car.mpg, 0) / carData.length;
  const progressPercentage = (averageMpg / 49) * 100;

  // Function to calculate average MPG for each brand
  const calculateBrandData = (data) => {
    const brandGroups = data.reduce((acc, car) => {
      if (!acc[car.brand]) acc[car.brand] = [];
      acc[car.brand].push(car.mpg);
      return acc;
    }, {});

    return Object.keys(brandGroups).map((brand) => ({
      brand,
      averageMpg:
        brandGroups[brand].reduce((sum, mpg) => sum + mpg, 0) /
        brandGroups[brand].length,
    }));
  };

  // Randomize MPG values every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCarData((prevData) =>
        prevData.map((car) => ({
          ...car,
          mpg: Math.floor(Math.random() * (40 - 15 + 1) + 15), // Random value between 15 and 40
        }))
      );
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Update brand data whenever car data changes
  useEffect(() => {
    setBrandData(calculateBrandData(carData));
  }, [carData]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Fuel Economy Dashboard
      </h1>

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
                {carData.filter(car => car.brand === 'Toyota').map((car) => (
                  <TableRow key={`${car.rank}-${car.model}`}>
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
            <CardTitle>Fuel Economy by Brand</CardTitle>
            <CardDescription>Comparing average MPG across brands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="max-mpg">Max MPG (up to 49)</Label>
              <Input
                id="max-mpg"
                type="number"
                value={maxMpg}
                onChange={(e) =>
                  setMaxMpg(
                    Math.min(49, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
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
                <BarChart data={brandData}>
                  <XAxis dataKey="brand" />
                  <YAxis domain={[0, maxMpg]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="averageMpg" fill="var(--color-mpg)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

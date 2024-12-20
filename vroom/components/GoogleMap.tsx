'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

interface LatLng {
  lat: number;
  lng: number;
}

const GoogleMap = () => {
  const mapRef = useRef(null);
  const markerRef = useRef<google.maps.Marker | null>(null); // Reference for the current marker
  const mapInstanceRef = useRef<google.maps.Map | null>(null); // Reference for the map instance
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [moneySaved, setMoneySaved] = useState(0); // Initial value
  const [targetMPG, setTargetMPG] = useState(0); // Holds target MPG value
  const [showVroom, setShowVroom] = useState(false); // Controls visibility of the button and MPG
  const [clickLocation, setClickLocation] = useState<LatLng | null>(null); // Stores the clicked location
  const [userLocation, setUserLocation] = useState<LatLng | null>(null); // Stores the user's location
  const [steps, setSteps] = useState<google.maps.DirectionsStep[]>([]); // Stores route steps
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Tracks the current step index
  const [distanceTraveled, setDistanceTraveled] = useState(0); // Total distance traveled in meters
  const [fuelUsed, setFuelUsed] = useState(0); // Total fuel used in gallons
  const [currentMPG, setCurrentMPG] = useState(0); // Real-time MPG
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState('');
  const watchIdRef = useRef<number | null>(null); // Ref to store the Geolocation watch ID

  const handleMapClick = (latLng: LatLng) => {
    setClickLocation(latLng);
    setTargetMPG(40); // Example target MPG
    setShowVroom(true);
  };

  const fetchDrivingInstructions = async (latitude: any, longitude: any) => {
    setLoading(true);
    try {
      // Mocked weather and time
      const weather = await fetchWeather(latitude, longitude);
      const time = fetchTime();
  
      // Shorter tips for optimizing fuel efficiency based on weather
      const fuelEfficiencyTips: Record<string, string> = {
        "clear sky": "Use cruise control.",
        "few clouds": "Avoid rapid acceleration.",
        "scattered clouds": "Keep windows closed.",
        "broken clouds": "Use A/C sparingly.",
        "shower rain": "Slow down, check tires.",
        "rain": "Avoid puddles, brake gently.",
        "thunderstorm": "Drive cautiously.",
        "snow": "Accelerate/brake gently.",
        "mist": "Maintain a steady speed.",
      };
  
      // Additional tips based on time of day
      const timeTips = {
        Morning: "Avoid idling to warm up your car—it wastes fuel. Start driving gently.",
        Afternoon: "Anticipate stop-and-go traffic to minimize fuel use in congestion.",
        Evening: "Drive smoothly to save fuel and reduce fatigue after a long day.",
      };
  
      // Determine the tip based on weather and time
      const weatherTip = fuelEfficiencyTips[weather as keyof typeof fuelEfficiencyTips] || "Drive safely to maximize fuel efficiency.";
      const timePeriod = time.includes("Afternoon") ? "Afternoon" : time.includes("Morning") ? "Morning" : "Evening";
      const timeTip = timeTips[timePeriod];
  
      // Combine tips
      const mockInstructions = `${weatherTip} ${timeTip}`;
      console.log(`Mocked instructions for ${weather}, ${time}: ${mockInstructions}`);
      setInstructions(mockInstructions);
    } catch (error) {
      console.error('Error generating mock driving instructions:', error);
      setInstructions('Unable to generate fuel efficiency tips.');
    } finally {
      setLoading(false);
    }
  };  

  const fetchWeather = (latitude: any, longitude: any) => {
    // Mock weather data
    const weatherConditions = [
      "clear sky",
      "few clouds",
      "scattered clouds",
      "broken clouds",
      "shower rain",
      "rain",
      "thunderstorm",
      "snow",
      "mist",
    ];
  
    // Helper function to get random weather
    const getRandomWeather = () => {
      const randomIndex = Math.floor(Math.random() * weatherConditions.length);
      return weatherConditions[randomIndex];
    };
  
    // Return random weather without delay
    const randomWeather = getRandomWeather();
    console.log(`Mock weather data for (${latitude}, ${longitude}):`, randomWeather);
    return Promise.resolve(randomWeather);
  };  
  
  const fetchTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isPM = hours >= 12;
  
    return `${isPM ? 'Afternoon' : 'Morning'} (${hours}:${minutes < 10 ? '0' : ''}${minutes})`;
  };

  const calculateDistance = (loc1: LatLng, loc2: LatLng): number => {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = (loc1.lat * Math.PI) / 180;
    const lat2 = (loc2.lat * Math.PI) / 180;
    const deltaLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const deltaLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance in meters
  };

  const updateDirections = (newLocation: LatLng) => {
    if (!clickLocation || !directionsServiceRef.current) {
      console.warn('Destination not set or Directions Service unavailable');
      return;
    }

    const request = {
      origin: newLocation,
      destination: clickLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current!.setDirections(result);

        if (!result) return

        if (!result.routes || !result.routes[0].legs || !result.routes[0].legs[0].steps) {
          console.error('No steps available in directions response');
          return;
        }

        // Update steps and reset the current step index
        setSteps(result.routes[0].legs[0].steps);
        setCurrentStepIndex(0);
      } else {
        console.error('Failed to update directions:', status);
      }
    });
  };

  const handleVroomClick = () => {
    if (!userLocation) {
      console.warn('User location not available');
      return;
    }

    // Calculate initial directions
    updateDirections(userLocation);

    // Start tracking user location
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Update distance traveled
          const distance = calculateDistance(userLocation, newLocation);
          setDistanceTraveled((prev) => prev + distance);

          // Simulate fuel usage
          const milesTraveled = distance / 1609.34; // Convert meters to miles
          const gallonsUsed = milesTraveled / targetMPG; // Assume target MPG for fuel usage
          setFuelUsed((prev) => prev + gallonsUsed);

          // Update real-time MPG
          setCurrentMPG((distanceTraveled + distance) / (fuelUsed + gallonsUsed));
          if (currentMPG >= targetMPG) {
            updateGas(); // Increment money saved
          }

          await fetchDrivingInstructions(userLocation.lat, userLocation.lng)

          setUserLocation(newLocation); // Update user location state
          updateDirections(newLocation); // Recalculate directions
        },
        (error) => {
          console.error('Error fetching real-time geolocation:', error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 1000 }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  };

  const updateGas = () => {
    setMoneySaved((prevMoneySaved) => {
      console.log('Previous Money Saved:', prevMoneySaved);
      return prevMoneySaved + 0.05;
    });
  };
  

  useEffect(() => {
    if (!mapRef.current) return;

    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    googleMapsScript.onload = () => {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default location: San Francisco
        zoom: 12,
      });

      mapInstanceRef.current = map;

      // Initialize Directions Service and Renderer
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: map,
      });

      // Center map on user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userLoc);
            map.setCenter(userLoc);

            // Add a marker at the user's location
            new google.maps.Marker({
              position: userLoc,
              map: map,
              title: 'Your Location',
            });
          },
          (error) => {
            console.error('Error fetching geolocation:', error);
          }
        );
      } else {
        console.warn('Geolocation is not supported by this browser.');
      }

      // Add click listener to the map
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const latLng = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };

          if (markerRef.current) {
            markerRef.current.setPosition(latLng);
          } else {
            markerRef.current = new google.maps.Marker({
              position: latLng,
              map: map,
              title: 'Clicked Location',
            });
          }

          handleMapClick(latLng);
        }
      });
    };

    document.head.appendChild(googleMapsScript);

    // Cleanup Geolocation watch on unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />

      {/* Directions Panel */}
      <div
        style={{
          position: 'absolute',
          top: '75px',
          right: '10px',
          width: '200px',
          maxHeight: '50vh', // Ensures the panel doesn't exceed half the viewport height
          overflowY: 'auto', // Allows scrolling if content exceeds max height
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
        }}
      >
        {steps.length > 0 && (
          <div>
            <p dangerouslySetInnerHTML={{ __html: steps[currentStepIndex].instructions }} />
            {(instructions) && <div>Tip: {instructions}</div>}
          </div>
        )}
      </div>


      {/* Money Saved Stat */}
      <Card className="absolute top-4 right-4 p-2 bg-green-500 text-white">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-bold">{moneySaved.toFixed(2)}</span>
          <span className="text-sm">saved/gallon</span>
        </div>
      </Card>

      {/* Conditionally render Vroom Button and Target MPG */}
      {showVroom && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 space-y-4 text-center">
        <div className="text-lg font-semibold bg-white p-2 rounded shadow">2024 RAV4 Hybrid: {targetMPG}mpg</div>
        <div className={`text-lg font-semibold bg-white p-2 rounded shadow ${currentMPG < targetMPG ? 'text-red-500' : 'text-green-500'}`}>
          Current: {currentMPG.toFixed(2)}mpg
        </div>
        <Button
          variant="default"
          size="lg"
          className="px-8 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-shadow duration-300"
          onClick={handleVroomClick}
        >
          Vroom
        </Button>
      </div>
      )}
    </div>
  );
};

export default GoogleMap;

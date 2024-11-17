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
  const [moneySaved, setMoneySaved] = useState(1.25); // Initial value
  const [targetMPG, setTargetMPG] = useState(0); // Holds target MPG value
  const [showVroom, setShowVroom] = useState(false); // Controls visibility of the button and MPG
  const [clickLocation, setClickLocation] = useState<LatLng | null>(null); // Stores the clicked location
  const [userLocation, setUserLocation] = useState<LatLng | null>(null); // Stores the user's location
  const [steps, setSteps] = useState<google.maps.DirectionsStep[]>([]); // Stores route steps
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Tracks the current step index
  const watchIdRef = useRef<number | null>(null); // Ref to store the Geolocation watch ID

  const handleMapClick = (latLng: LatLng) => {
    setClickLocation(latLng);
    setTargetMPG(45); // Example target MPG
    setShowVroom(true);
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
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
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
          top: '10px',
          right: '10px',
          width: '300px',
          height: '200px',
          overflow: 'auto',
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
        }}
      >
        {steps.length > 0 && (
          <>
            <div>
              <strong>Step {currentStepIndex + 1} of {steps.length}:</strong>
              <p dangerouslySetInnerHTML={{ __html: steps[currentStepIndex].instructions }} />
            </div>
          </>
        )}
      </div>

      {/* Money Saved Stat */}
      <Card className="absolute top-4 left-4 p-2 bg-green-500 text-white">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-bold">{moneySaved.toFixed(2)}</span>
          <span className="text-sm">saved/gallon</span>
        </div>
      </Card>

      {/* Conditionally render Vroom Button and Target MPG */}
      {showVroom && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 space-y-4 text-center">
          <div className="text-lg font-semibold">Target MPG: {targetMPG}</div>
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

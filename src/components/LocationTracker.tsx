import { useState, useEffect } from 'react';
import { Card } from './ui/card';

interface LocationTrackerProps {
  onLocationUpdate: (location: { latitude: number; longitude: number; address: string }) => void;
}

const LocationTracker = ({ onLocationUpdate }: LocationTrackerProps) => {
  const [status, setStatus] = useState<string>('Getting location...');

  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        // Get readable address using reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const address = data.display_name;

        console.log('Location captured:', { latitude, longitude, address });
        onLocationUpdate({ latitude, longitude, address });
        setStatus('Location captured successfully');
      } catch (error) {
        console.error('Error getting location:', error);
        setStatus('Error getting location. Please enable location services.');
      }
    };

    getLocation();
  }, [onLocationUpdate]);

  return (
    <Card className="p-4 text-center">
      <p>{status}</p>
    </Card>
  );
};

export default LocationTracker;
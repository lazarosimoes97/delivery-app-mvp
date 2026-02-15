import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    const markerRef = useRef(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [position]);

    return position === null ? null : (
        <Marker
            position={position}
            ref={markerRef}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    setPosition(e.target.getLatLng());
                }
            }}
        />
    );
}

const ChangeView = ({ center }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const LocationPicker = ({ onLocationChange, initialPosition }) => {
    // Default position (Center of Brazil or User's location if available)
    const [position, setPosition] = useState(initialPosition || { lat: -23.550520, lng: -46.633308 }); // Sao Paulo default

    useEffect(() => {
        if (navigator.geolocation && !initialPosition) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setPosition(newPos);
                    onLocationChange(newPos);
                },
                (err) => {
                    console.error("Error getting location", err);
                }
            );
        }
    }, []);

    const handlePositionChange = (newPos) => {
        setPosition(newPos);
        onLocationChange(newPos);
    };

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 z-0">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={position} />
                <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;

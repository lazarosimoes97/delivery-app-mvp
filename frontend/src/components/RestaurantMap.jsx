import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

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

const RestaurantMap = ({ restaurants }) => {
    const { location: userLocation } = useLocation();

    // Center map on Charqueada by default
    const charqueadaCoords = [-22.50972, -47.77806];

    // Priority: 1. User Location, 2. First restaurant, 3. Charqueada
    const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : (restaurants.length > 0 && restaurants[0].latitude
            ? [restaurants[0].latitude, restaurants[0].longitude]
            : charqueadaCoords);

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {restaurants.map((restaurant) => (
                    restaurant.latitude && restaurant.longitude && (
                        <Marker
                            key={restaurant.id}
                            position={[restaurant.latitude, restaurant.longitude]}
                        >
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h3 className="font-bold text-base mb-1">{restaurant.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2 truncate">{restaurant.category} • {restaurant.type}</p>
                                    <Link
                                        to={`/restaurant/${restaurant.id}`}
                                        className="flex items-center text-red-600 font-bold text-xs hover:underline"
                                    >
                                        Ver Cardápio <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default RestaurantMap;

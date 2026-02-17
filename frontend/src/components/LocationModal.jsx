import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Component to recenter map when coordinates change
function ChangeView({ center }) {
    const map = L.DomUtil.get('map') ? null : useMapEvents({}); // This is just to get access to map instance via useMap if needed
    // Actually simpler way in react-leaflet:
    const leafletMap = L.DomUtil.get('map') ? null : null; // ignore
    return null;
}

import { useMap } from 'react-leaflet';
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

const LocationModal = ({ isOpen, onClose }) => {
    const { updateLocation } = useLocation();
    const [view, setView] = useState('initial'); // initial, map, loading
    const [mapPosition, setMapPosition] = useState({ lat: -22.50972, lng: -47.77806 }); // Default: Charqueada, SP
    const [markerPosition, setMarkerPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleUseMyLocation = () => {
        setLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Geolocalização não é suportada pelo seu navegador.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newCoords = { lat: latitude, lng: longitude };
                setMarkerPosition(newCoords);
                setMapPosition(newCoords);
                setView('map');
                setLoading(false);
            },
            (err) => {
                console.error(err);
                if (err.code === 1) { // PERMISSION_DENIED
                    setError('Por favor, permita o acesso à localização para continuar.');
                } else {
                    setError('Não foi possível obter sua localização. Tente novamente ou selecione no mapa.');
                }
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleConfirmMapLocation = () => {
        if (markerPosition) {
            updateLocation(markerPosition, 'Selecionado no Mapa');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 md:p-6 overflow-y-auto">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Onde você quer receber seu pedido?</h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                            {error} <br />
                            {error.includes('permita') && <span className="text-xs mt-1 block">Verifique as configurações do navegador para habilitar o acesso à localização.</span>}
                        </div>
                    )}

                    {view === 'initial' && (
                        <div className="space-y-3 md:space-y-4 mt-4 md:mt-6">
                            <button
                                onClick={handleUseMyLocation}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition text-sm md:text-base"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                Usar minha localização atual
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-sm">Ou</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <button
                                onClick={() => setView('map')}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition text-sm md:text-base"
                            >
                                <MapPin className="w-5 h-5" />
                                Selecionar no mapa
                            </button>
                        </div>
                    )}

                    {view === 'map' && (
                        <div className="mt-4">
                            <div className="h-56 md:h-64 w-full rounded-lg overflow-hidden mb-4 border border-gray-200 relative">
                                <MapContainer
                                    center={mapPosition}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <RecenterMap center={mapPosition} />
                                    <LocationMarker position={markerPosition} setPosition={setMarkerPosition} />
                                </MapContainer>
                                {!markerPosition && (
                                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-medium shadow-sm z-[400] pointer-events-none whitespace-nowrap">
                                        Toque no mapa para marcar a localização
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setView('initial')}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded text-sm md:text-base"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleConfirmMapLocation}
                                    disabled={!markerPosition}
                                    className={`flex-1 font-medium py-2 px-4 rounded transition text-sm md:text-base ${markerPosition
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;

import { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);

    // Initial load from local storage if needed, or just kept in memory
    // For MVP, we'll keep it in memory or persist to localStorage to avoid stale location issues
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            const parsed = JSON.parse(savedLocation);
            // Migrar valores antigos em inglês para português
            let migratedAddress = parsed.address;
            if (migratedAddress === 'Current Location') {
                migratedAddress = 'Localização Atual';
            }
            if (migratedAddress === 'Selected on Map') {
                migratedAddress = 'Selecionado no Mapa';
            }
            setLocation(parsed.coords);
            setAddress(migratedAddress);
            // Atualizar o localStorage com o valor traduzido
            if (migratedAddress !== parsed.address) {
                localStorage.setItem('userLocation', JSON.stringify({ coords: parsed.coords, address: migratedAddress }));
            }
        }
    }, []);

    const updateLocation = (coords, addr = 'Localização Atual') => {
        setLocation(coords);
        setAddress(addr);
        localStorage.setItem('userLocation', JSON.stringify({ coords, address: addr }));
    };

    return (
        <LocationContext.Provider value={{ location, address, updateLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

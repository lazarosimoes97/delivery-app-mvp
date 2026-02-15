import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, ChevronRight, Search, MapPin } from 'lucide-react';
import axios from 'axios';
import LocationPicker from '../components/LocationPicker';

const Register = () => {
    const [role, setRole] = useState('CLIENT'); // CLIENT or RESTAURANT_OWNER
    const [step, setStep] = useState(1); // 1: Choose Role, 2: Fill Form
    const [loading, setLoading] = useState(false);

    // User Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Restaurant Data
    const [restaurantName, setRestaurantName] = useState('');
    const [document, setDocument] = useState('');
    const [type, setType] = useState('Restaurante');
    const [category, setCategory] = useState('Geral');
    const [description, setDescription] = useState('');

    // Address Data
    const [zipCode, setZipCode] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [reference, setReference] = useState('');
    const [location, setLocation] = useState({ lat: -23.550520, lng: -46.633308 }); // Default SP

    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
        setError('');
    };

    const handleZipCodeBlur = async () => {
        const cleanZip = zipCode.replace(/\D/g, '');
        if (cleanZip.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cleanZip}/json/`);
                if (!response.data.erro) {
                    setStreet(response.data.logradouro);
                    setNeighborhood(response.data.bairro);
                    setCity(response.data.localidade);
                    setState(response.data.uf);

                    // Tentar obter coordenadas do endereço
                    fetchCoordinates(response.data.logradouro, response.data.localidade, response.data.uf, cleanZip);
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
            }
        }
    };

    const fetchCoordinates = async (logradouro, localidade, uf, cep) => {
        try {
            // TENTATIVA 1: Endereço completo
            let query = `${logradouro}, ${localidade}, ${uf}, Brazil`;
            if (!logradouro) query = `${localidade}, ${uf}, Brazil`;

            let response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);

            // TENTATIVA 2: Apenas o CEP (muito preciso se o OSM tiver o CEP mapeado)
            if ((!response.data || response.data.length === 0) && cep) {
                const cepQuery = `${cep.substring(0, 5)}-${cep.substring(5)}, Brazil`;
                response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cepQuery)}`);

                // Backup se o CEP com hífen não funcionar
                if (!response.data || response.data.length === 0) {
                    response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${cep}, Brazil`);
                }
            }

            // TENTATIVA 3: Apenas Cidade e Estado (último recurso)
            if (!response.data || response.data.length === 0) {
                response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${localidade}, ${uf}, Brazil`);
            }

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
            }
        } catch (error) {
            console.error("Erro ao buscar coordenadas", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = {
                name,
                email,
                password,
                role
            };

            if (role === 'RESTAURANT_OWNER') {
                userData.restaurant = {
                    name: restaurantName,
                    document,
                    type,
                    category,
                    description,
                    // Address Details
                    zipCode,
                    state,
                    city,
                    neighborhood,
                    street,
                    number,
                    complement,
                    reference,
                    latitude: location.lat,
                    longitude: location.lng
                };
            }

            const result = await register(userData);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Erro ao criar conta');
            }
        } catch (err) {
            setError(err.message || 'Erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
                <div className="max-w-2xl w-full">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Como você deseja usar o app?</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <button
                            onClick={() => handleRoleSelection('CLIENT')}
                            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-red-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <User className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quero Pedir</h3>
                            <p className="text-gray-600 mb-4">Encontre seus restaurantes favoritos e receba em casa.</p>
                            <div className="flex items-center text-red-600 font-medium">
                                Criar conta de usuário <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </button>

                        <button
                            onClick={() => handleRoleSelection('RESTAURANT_OWNER')}
                            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-blue-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Store className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quero Vender</h3>
                            <p className="text-gray-600 mb-4">Gerencie seu restaurante, cardápio e receba pedidos.</p>
                            <div className="flex items-center text-blue-600 font-medium">
                                Cadastrar meu restaurante <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600">
                            Já tem uma conta? <Link to="/login" className="text-red-600 hover:underline font-medium">Fazer Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                <button
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-700 mb-6 flex items-center text-sm"
                >
                    ← Voltar para seleção
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {role === 'CLIENT' ? 'Criar Conta de Usuário' : 'Cadastrar Restaurante'}
                </h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seção de Dados de Acesso */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Dados de Acesso</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-2">Senha</label>
                                <input
                                    type="password"
                                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="********"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção de Dados do Restaurante (Apenas para donos) */}
                    {role === 'RESTAURANT_OWNER' && (
                        <div className="animate-fade-in space-y-6">
                            {/* Dados Básicos */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 mt-8">Dados do Estabelecimento</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Nome do Estabelecimento</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                            required
                                            placeholder="Ex: Pizzaria do João"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">CPF / CNPJ</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={document}
                                            onChange={(e) => setDocument(e.target.value)}
                                            required
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Tipo de Estabelecimento</label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="Restaurante">Restaurante</option>
                                            <option value="Lanchonete">Lanchonete</option>
                                            <option value="Mercado">Mercado</option>
                                            <option value="Farmácia">Farmácia</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Categoria Principal</label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="Geral">Geral</option>
                                            <option value="Pizza">Pizza</option>
                                            <option value="Hambúrguer">Hambúrguer</option>
                                            <option value="Japonesa">Japonesa</option>
                                            <option value="Brasileira">Brasileira</option>
                                            <option value="Italiana">Italiana</option>
                                            <option value="Doces & Bolos">Doces & Bolos</option>
                                            <option value="Açaí">Açaí</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Descrição</label>
                                        <textarea
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="2"
                                            placeholder="Uma breve descrição do seu negócio..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Endereço e Localização */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                                    <MapPin size={20} />
                                    Localização e Endereço
                                </h3>

                                <div className="grid md:grid-cols-4 gap-4 mb-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">CEP</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                onBlur={handleZipCodeBlur}
                                                required
                                                placeholder="00000-000"
                                            />
                                            <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Cidade</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg bg-gray-50"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                            readOnly // Preenchido pelo CEP
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Estado</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg bg-gray-50"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            required
                                            readOnly // Preenchido pelo CEP
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4 gap-4 mb-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Rua / Logradouro</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Número</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={number}
                                            onChange={(e) => setNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Bairro</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={neighborhood}
                                            onChange={(e) => setNeighborhood(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Complemento</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={complement}
                                            onChange={(e) => setComplement(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Ponto de Referência</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Confira a localização no mapa (Arraste o marcador se necessário)
                                    </label>
                                    <div className="h-[300px] w-full rounded-lg overflow-hidden border relative">
                                        <LocationPicker
                                            onLocationChange={setLocation}
                                            initialPosition={location}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fetchCoordinates(street, city, state, zipCode)}
                                            className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded-md shadow-md text-xs font-bold text-blue-600 hover:bg-gray-50 border border-gray-200"
                                        >
                                            🔄 Atualizar Mapa
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${role === 'CLIENT'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;

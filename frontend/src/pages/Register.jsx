import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, ChevronRight, Search, MapPin, Image as ImageIcon, CheckCircle2, Plus } from 'lucide-react';
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
    const [restaurantImage, setRestaurantImage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [location, setLocation] = useState({ lat: -22.50972, lng: -47.77806 }); // Default Charqueada

    const handleRestaurantImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingImage(true);
        try {
            const res = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setRestaurantImage(res.data.url);
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Falha ao subir imagem do restaurante.');
        } finally {
            setUploadingImage(false);
        }
    };

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

        let registrationResult;

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
                    imageUrl: restaurantImage,
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

            registrationResult = await register(userData);

            if (registrationResult.success) {
                if (role === 'RESTAURANT_OWNER') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(registrationResult.error || 'Erro ao criar conta');
            }
        } catch (err) {
            setError(err.message || 'Erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-red-600 to-red-800 transform -skew-y-6 origin-top-left z-0"></div>

                <div className="relative z-10 max-w-4xl mx-auto w-full">
                    <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-700 fade-in">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-red-900/20">
                                <Store className="w-10 h-10 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                            Bem-vindo ao Charq<span className="text-red-600">Food</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-lg mx-auto font-medium">
                            Conectando sabores e pessoas. Como você deseja participar dessa experiência?
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {/* Client Card */}
                        <button
                            onClick={() => handleRoleSelection('CLIENT')}
                            className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 border-2 border-transparent hover:border-red-500 text-left w-full overflow-hidden animate-in zoom-in-95 duration-500 delay-100 fill-mode-backwards"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                    <User className="w-8 h-8" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                    Quero Pedir
                                </h3>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                                    Explore os melhores restaurantes da cidade e receba sua comida favorita no conforto de casa.
                                </p>
                                <div className="flex items-center text-red-600 font-bold group-hover:translate-x-2 transition-transform">
                                    Criar conta grátis <ChevronRight className="w-5 h-5 ml-1" strokeWidth={3} />
                                </div>
                            </div>
                        </button>

                        {/* Restaurant Card */}
                        <button
                            onClick={() => handleRoleSelection('RESTAURANT_OWNER')}
                            className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-2 border-transparent hover:border-blue-500 text-left w-full overflow-hidden animate-in zoom-in-95 duration-500 delay-200 fill-mode-backwards"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                                    <Store className="w-8 h-8" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    Quero Vender
                                </h3>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                                    Gerencie seu cardápio, receba pedidos em tempo real e expanda seu negócio com nossa plataforma.
                                </p>
                                <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                                    Parceiro Comercial <ChevronRight className="w-5 h-5 ml-1" strokeWidth={3} />
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="text-center mt-12 animate-in fade-in duration-1000 delay-300">
                        <p className="text-gray-500 font-medium">
                            Já possui uma conta? <Link to="/login" className="text-red-600 hover:text-red-700 font-bold hover:underline ml-1">Fazer Login</Link>
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
                                        <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-blue-600" /> Foto de Capa do Restaurante
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors p-4 rounded-xl flex-1 flex flex-col items-center justify-center gap-2 min-h-[100px]">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleRestaurantImageUpload}
                                                    accept="image/*"
                                                />
                                                {uploadingImage ? (
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                        Subindo...
                                                    </div>
                                                ) : restaurantImage ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-bold">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        Foto Escolhida!
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                                        <Plus className="w-5 h-5" />
                                                        <span className="text-xs">Subir Logo ou Fachada</span>
                                                    </div>
                                                )}
                                            </label>
                                            {restaurantImage && (
                                                <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                                    <img src={restaurantImage} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
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

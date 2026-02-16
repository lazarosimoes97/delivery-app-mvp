import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const Security = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            return setStatus({ type: 'error', message: 'As senhas não coincidem' });
        }

        if (formData.newPassword.length < 6) {
            return setStatus({ type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.put('/users/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setStatus({ type: 'success', message: 'Senha atualizada com sucesso!' });
            setTimeout(() => navigate('/profile'), 1500);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.error || 'Erro ao atualizar senha'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white md:bg-gray-50 md:py-8">
            <div className="bg-white md:rounded-3xl md:shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-red-500 transition">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="flex-1 text-center font-bold text-gray-800 text-lg uppercase tracking-wider">Segurança</h2>
                    <div className="w-6"></div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                        <p className="text-xs text-blue-700 leading-tight">Mantenha sua conta segura trocando sua senha periodicamente.</p>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="text-sm font-medium">{status.message}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Senha Atual</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-gray-800 font-medium"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Nova Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-gray-800 font-medium"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Confirmar Nova Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-gray-800 font-medium"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 shadow-lg shadow-red-100 hover:bg-red-700 transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <span>Atualizar Senha</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Security;

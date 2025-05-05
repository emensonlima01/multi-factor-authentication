import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <Button variant="secondary" onClick={handleLogout} className="w-full sm:w-auto">
                        Sair
                    </Button>
                </div>
            </header>
            <main className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
                <div className="py-4 sm:py-6">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg min-h-[16rem] p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Bem-vindo, {user?.name || 'Usuário'}!</h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            Você está autenticado com sucesso utilizando a autenticação multifator.
                        </p>
                        <div className="mt-6 sm:mt-8">
                            <h3 className="text-base sm:text-lg font-medium mb-2">Seus dados:</h3>
                            <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                                <li><span className="font-semibold">Nome:</span> {user?.name}</li>
                                <li><span className="font-semibold">Email:</span> {user?.email}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;

import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import OTPField from '../components/OTPField';

// Schema de validação para o formulário de login
const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
    password: Yup.string()
        .required('Senha é obrigatória')
        .min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, verifyOtp } = useAuth();

    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [loginToken, setLoginToken] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    // Configuração do formulário de login com formik
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            try {
                setErrorMessage('');
                const response = await login(values.email, values.password);

                if (response.requiresMfa) {
                    // Se MFA for necessário, mostra o formulário de OTP
                    setShowOtpForm(true);
                    setLoginToken(response.token);
                    setLoginEmail(values.email);
                } else {
                    // Se autenticação for bem-sucedida e não precisar de MFA, redireciona
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                setErrorMessage('Usuário ou senha incorretos.');
            }
        },
    });

    // Verificação do código OTP
    const handleVerifyOtp = async () => {
        try {
            // Não fazer nada se já estiver processando ou o código não for completo
            if (otpLoading || otpValue.length !== 6) {
                if (otpValue.length !== 6) {
                    setOtpError('O código OTP deve ter 6 dígitos');
                }
                return;
            }

            setOtpError('');
            setOtpLoading(true);

            console.log('Enviando verificação OTP para login:', {
                email: loginEmail,
                otpCode: otpValue
            });

            const isVerified = await verifyOtp(loginEmail, otpValue, loginToken);

            console.log('Resultado da verificação OTP:', isVerified);

            if (isVerified) {
                navigate('/dashboard');
            } else {
                setOtpError('Código OTP inválido. Tente novamente.');
            }
        } catch (error: any) {
            console.error('Erro ao verificar OTP:', error);
            const errorMessage = error.response?.data?.message || 'Código OTP inválido. Tente novamente.';
            setOtpError(errorMessage);
            setOtpError('Código OTP inválido ou expirado.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 py-6 sm:px-6 md:px-8">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Login</h1>
                    <p className="text-sm sm:text-base text-gray-600">Acesse sua conta para continuar</p>
                </div>

                {errorMessage && (
                    <Alert
                        type="error"
                        message={errorMessage}
                        onDismiss={() => setErrorMessage('')}
                    />
                )}

                <Card>
                    {!showOtpForm ? (
                        // Formulário de login
                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <FormInput
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="seu@email.com"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email ? formik.errors.email : undefined}
                            />

                            <FormInput
                                id="password"
                                name="password"
                                type="password"
                                label="Senha"
                                placeholder="********"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password ? formik.errors.password : undefined}
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <label className="flex items-center">
                                    <input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                                        checked={formik.values.rememberMe}
                                        onChange={formik.handleChange}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
                                </label>

                                <Link to="/recuperar-senha" className="text-sm text-blue-600 hover:underline">
                                    Esqueci minha senha
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? 'Entrando...' : 'Entrar'}
                            </Button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Não tem uma conta?{' '}
                                    <Link to="/cadastro" className="text-blue-600 hover:underline">
                                        Cadastre-se
                                    </Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        // Formulário de verificação OTP
                        <div className="space-y-4">
                            <div className="text-center mb-4">
                                <h3 className="text-base sm:text-lg font-semibold">Verificação em Duas Etapas</h3>
                                <p className="text-xs sm:text-sm text-gray-600 px-2">
                                    Digite o código gerado pelo seu aplicativo autenticador
                                </p>
                            </div>

                            <OTPField
                                value={otpValue}
                                onChange={(value) => {
                                    setOtpValue(value);
                                    // Limpar erros quando o usuário começa a digitar um novo código
                                    if (otpError) {
                                        setOtpError('');
                                    }
                                }}
                                error={otpError}
                                onComplete={handleVerifyOtp}
                                autoSubmit={!otpLoading}
                            />

                            <Button
                                onClick={handleVerifyOtp}
                                fullWidth
                                disabled={otpValue.length !== 6 || otpLoading}
                            >
                                {otpLoading ? (
                                    <span className="flex items-center justify-center text-sm sm:text-base">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verificando...
                                    </span>
                                ) : (
                                    'Verificar'
                                )}
                            </Button>

                            <div className="text-center mt-2">
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={() => setShowOtpForm(false)}
                                    disabled={otpLoading}
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;

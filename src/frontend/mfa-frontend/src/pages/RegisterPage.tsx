import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import MFASetup from '../components/MFASetup';
import OTPField from '../components/OTPField';
import authService from '../services/authService';

// Schema de validação para o formulário de cadastro
const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .required('Nome completo é obrigatório'),
    email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
    password: Yup.string()
        .required('Senha é obrigatória')
        .min(8, 'A senha deve ter pelo menos 8 caracteres')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número'
        ),
    confirmPassword: Yup.string()
        .required('Confirmação de senha é obrigatória')
        .oneOf([Yup.ref('password')], 'As senhas não coincidem'),
    terms: Yup.boolean()
        .oneOf([true], 'Você deve aceitar os termos e condições')
});

// Constantes para os passos do cadastro
const RegistrationStep = {
    FORM: 'form',
    MFA_SETUP: 'mfa_setup',
    MFA_VERIFICATION: 'mfa_verification',
    SUCCESS: 'success'
} as const;

type RegistrationStepType = typeof RegistrationStep[keyof typeof RegistrationStep];

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [currentStep, setCurrentStep] = useState<RegistrationStepType>(RegistrationStep.FORM);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [setupToken, setSetupToken] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [otpLoading, setOtpLoading] = useState<boolean>(false);

    // Configuração do formulário de cadastro com formik
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values) => {
            try {
                setErrorMessage('');
                // Enviar os dados de registro para a API
                const response = await register(
                    values.name,
                    values.email,
                    values.password,
                    values.confirmPassword
                );

                if (response.qrCodeUrl) {
                    // Avançar para a configuração do MFA
                    setQrCodeUrl(response.qrCodeUrl);
                    setSetupToken(response.token);
                    setRegisteredEmail(values.email);
                    setCurrentStep(RegistrationStep.MFA_SETUP);
                } else {
                    // Se algo der errado
                    setErrorMessage('Erro ao processar o cadastro. Tente novamente.');
                }
            } catch (error: any) {
                console.error('Erro ao cadastrar:', error);
                setErrorMessage(error.response?.data?.message || 'Erro ao processar o cadastro');
            }
        },
    });

    // Verificação do código OTP para conclusão do cadastro
    const handleVerifyOtp = async () => {
        try {
            // Não fazer nada se já estiver carregando ou código não tiver 6 dígitos
            if (otpLoading || otpValue.length !== 6) {
                if (otpValue.length !== 6) {
                    setOtpError('O código OTP deve ter 6 dígitos');
                }
                return;
            }

            setOtpError('');
            setOtpLoading(true);

            console.log('Enviando verificação OTP:', {
                email: registeredEmail,
                token: setupToken,
                otpValue: otpValue
            });

            // Validar o código OTP
            const response = await authService.setupMfa({
                email: registeredEmail,
                otpCode: otpValue,
                token: setupToken
            });

            console.log('Resposta da verificação OTP:', response);

            // Verificar se a resposta inclui um token válido
            if (response && response.token) {
                // Cadastro concluído com sucesso
                setCurrentStep(RegistrationStep.SUCCESS);
            } else {
                // Resposta sem token válido
                setOtpError('Falha na verificação. Tente novamente.');
            }
        } catch (error: any) {
            console.error('Erro ao verificar OTP:', error);
            const errorMessage = error.response?.data?.message || 'Código OTP inválido. Tente novamente.';
            setOtpError(errorMessage);
        } finally {
            setOtpLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case RegistrationStep.FORM:
                return (
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <FormInput
                            id="name"
                            name="name"
                            type="text"
                            label="Nome Completo"
                            placeholder="Seu Nome Completo"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name ? formik.errors.name : undefined}
                        />

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

                        <FormInput
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            label="Confirme a Senha"
                            placeholder="********"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
                        />

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                                    checked={formik.values.terms}
                                    onChange={formik.handleChange}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="text-gray-600">
                                    Eu aceito os{' '}
                                    <Link to="/termos" className="text-blue-600 hover:underline">
                                        Termos de Uso
                                    </Link>{' '}
                                    e a{' '}
                                    <Link to="/privacidade" className="text-blue-600 hover:underline">
                                        Política de Privacidade
                                    </Link>
                                </label>
                                {formik.touched.terms && formik.errors.terms && (
                                    <p className="text-red-500 text-xs italic mt-1">{formik.errors.terms}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="text-blue-600 hover:underline">
                                    Faça login
                                </Link>
                            </p>
                        </div>
                    </form>
                );

            case RegistrationStep.MFA_SETUP:
                return (
                    <div className="space-y-6">
                        <MFASetup
                            qrCodeUrl={qrCodeUrl}
                            onError={(errorMsg) => setErrorMessage(errorMsg)}
                        />

                        {errorMessage && (
                            <div className="text-red-500 text-sm text-center">
                                {errorMessage}
                            </div>
                        )}

                        <div className="text-center mt-6">
                            <Button
                                onClick={() => setCurrentStep(RegistrationStep.MFA_VERIFICATION)}
                                fullWidth
                                disabled={!qrCodeUrl}
                            >
                                Continuar
                            </Button>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            <p>
                                Problemas para escanear o QR code? Verifique se você tem um aplicativo autenticador
                                instalado como Google Authenticator ou Microsoft Authenticator.
                            </p>
                        </div>
                    </div>
                );

            case RegistrationStep.MFA_VERIFICATION:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold">Verificação do Autenticador</h3>
                            <p className="text-sm text-gray-600">
                                Digite o código exibido no seu aplicativo autenticador para confirmar a configuração
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
                            autoSubmit={true}
                        />

                        <Button
                            onClick={handleVerifyOtp}
                            fullWidth
                            disabled={otpValue.length !== 6 || otpLoading}
                        >
                            {otpLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verificando...
                                </span>
                            ) : (
                                'Verificar e Concluir'
                            )}
                        </Button>

                        <div className="text-center mt-2">
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:underline"
                                onClick={() => setCurrentStep(RegistrationStep.MFA_SETUP)}
                            >
                                Voltar para o QR Code
                            </button>
                        </div>
                    </div>
                );

            case RegistrationStep.SUCCESS:
                return (
                    <div className="text-center space-y-6">
                        <div className="text-green-500 mb-4">
                            <svg
                                className="mx-auto h-12 w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <h3 className="text-lg font-semibold">Cadastro Concluído com Sucesso!</h3>

                        <p className="text-sm text-gray-600">
                            Sua conta foi criada e a autenticação de dois fatores foi configurada.
                        </p>

                        <div className="mt-6">
                            <Button
                                onClick={() => navigate('/login')}
                                fullWidth
                                variant="primary"
                            >
                                Ir para o Login
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Criar Conta</h1>
                    <p className="text-gray-600">Preencha os dados para se cadastrar</p>
                </div>

                {errorMessage && (
                    <Alert
                        type="error"
                        message={errorMessage}
                        onDismiss={() => setErrorMessage('')}
                    />
                )}

                <Card>
                    {renderStep()}
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;

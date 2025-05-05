import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import MFASetup from '../components/MFASetup';
import OTPField from '../components/OTPField';
import authService from '../services/authService';

// Schema de validação para o formulário de recuperação de senha
const RecoverySchema = Yup.object().shape({
    name: Yup.string()
        .required('Nome completo é obrigatório'),
    additionalInfo: Yup.string()
        .required('Informação adicional é obrigatória')
});

// Schema de validação para o formulário de redefinição de senha
const ResetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
        .required('Nova senha é obrigatória')
        .min(8, 'A senha deve ter pelo menos 8 caracteres')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número'
        ),
    confirmNewPassword: Yup.string()
        .required('Confirmação de senha é obrigatória')
        .oneOf([Yup.ref('newPassword')], 'As senhas não coincidem')
});

// Constantes para os passos da recuperação de senha
const RecoveryStep = {
    FORM: 'form',
    MFA_SETUP: 'mfa_setup',
    MFA_VERIFICATION: 'mfa_verification',
    RESET_PASSWORD: 'reset_password',
    SUCCESS: 'success'
} as const;

type RecoveryStepType = typeof RecoveryStep[keyof typeof RecoveryStep];

const RecoveryPasswordPage = () => {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<RecoveryStepType>(RecoveryStep.FORM);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('');

    // Formulário de recuperação de senha
    const recoveryFormik = useFormik({
        initialValues: {
            name: '',
            additionalInfo: ''
        },
        validationSchema: RecoverySchema,
        onSubmit: async (values) => {
            try {
                setErrorMessage('');
                // Enviar solicitação de recuperação de senha
                const response = await authService.recoverPassword({
                    name: values.name,
                    additionalInfo: values.additionalInfo
                });

                if (response.qrCodeUrl && response.token) {
                    // Avançar para a configuração do MFA
                    setQrCodeUrl(response.qrCodeUrl);
                    setToken(response.token);
                    setRecoveryEmail(response.user?.email || '');
                    setCurrentStep(RecoveryStep.MFA_SETUP);
                } else {
                    // Se algo der errado
                    setErrorMessage('Não foi possível recuperar a conta. Verifique as informações e tente novamente.');
                }
            } catch (error: any) {
                console.error('Erro ao recuperar senha:', error);
                setErrorMessage(error.response?.data?.message || 'Erro ao processar a recuperação');
            }
        }
    });

    // Formulário de redefinição de senha
    const resetFormik = useFormik({
        initialValues: {
            newPassword: '',
            confirmNewPassword: ''
        },
        validationSchema: ResetPasswordSchema,
        onSubmit: async (values) => {
            try {
                setErrorMessage('');
                // Enviar solicitação de redefinição de senha
                await authService.resetPassword({
                    email: recoveryEmail,
                    otpCode: otpValue,
                    token: token,
                    newPassword: values.newPassword,
                    confirmNewPassword: values.confirmNewPassword
                });

                // Senha redefinida com sucesso
                setCurrentStep(RecoveryStep.SUCCESS);
            } catch (error: any) {
                console.error('Erro ao redefinir senha:', error);
                setErrorMessage(error.response?.data?.message || 'Erro ao redefinir a senha');
            }
        }
    });

    // Verificação do código OTP
    const handleVerifyOtp = async () => {
        try {
            setOtpError('');

            if (otpValue.length !== 6) {
                setOtpError('O código OTP deve ter 6 dígitos');
                return;
            }

            // Avançar para o passo de redefinição de senha
            setCurrentStep(RecoveryStep.RESET_PASSWORD);
        } catch (error) {
            console.error('Erro ao verificar OTP:', error);
            setOtpError('Código OTP inválido. Tente novamente.');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case RecoveryStep.FORM:
                return (
                    <form onSubmit={recoveryFormik.handleSubmit} className="space-y-4">
                        <FormInput
                            id="name"
                            name="name"
                            type="text"
                            label="Nome Completo"
                            placeholder="Digite seu nome completo"
                            value={recoveryFormik.values.name}
                            onChange={recoveryFormik.handleChange}
                            onBlur={recoveryFormik.handleBlur}
                            error={recoveryFormik.touched.name ? recoveryFormik.errors.name : undefined}
                        />

                        <FormInput
                            id="additionalInfo"
                            name="additionalInfo"
                            type="text"
                            label="Data de nascimento ou informação cadastral"
                            placeholder="Ex: 01/01/1990"
                            value={recoveryFormik.values.additionalInfo}
                            onChange={recoveryFormik.handleChange}
                            onBlur={recoveryFormik.handleBlur}
                            error={recoveryFormik.touched.additionalInfo ? recoveryFormik.errors.additionalInfo : undefined}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={recoveryFormik.isSubmitting}
                        >
                            {recoveryFormik.isSubmitting ? 'Processando...' : 'Recuperar Senha'}
                        </Button>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-blue-600 hover:underline">
                                Voltar para o Login
                            </Link>
                        </div>
                    </form>
                );

            case RecoveryStep.MFA_SETUP:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold">Configurar Nova Autenticação</h3>
                            <p className="text-sm text-gray-600">
                                Escaneie o QR Code abaixo com seu aplicativo autenticador
                            </p>
                        </div>

                        <MFASetup qrCodeUrl={qrCodeUrl} />

                        <div className="text-center mt-6">
                            <Button
                                onClick={() => setCurrentStep(RecoveryStep.MFA_VERIFICATION)}
                                fullWidth
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                );

            case RecoveryStep.MFA_VERIFICATION:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold">Verificação do Autenticador</h3>
                            <p className="text-sm text-gray-600">
                                Digite o código exibido no seu aplicativo autenticador
                            </p>
                        </div>

                        <OTPField
                            value={otpValue}
                            onChange={setOtpValue}
                            error={otpError}
                        />

                        <Button
                            onClick={handleVerifyOtp}
                            fullWidth
                        >
                            Verificar
                        </Button>
                    </div>
                );

            case RecoveryStep.RESET_PASSWORD:
                return (
                    <form onSubmit={resetFormik.handleSubmit} className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold">Redefinir Senha</h3>
                            <p className="text-sm text-gray-600">
                                Digite sua nova senha
                            </p>
                        </div>

                        <FormInput
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            label="Nova Senha"
                            placeholder="********"
                            value={resetFormik.values.newPassword}
                            onChange={resetFormik.handleChange}
                            onBlur={resetFormik.handleBlur}
                            error={resetFormik.touched.newPassword ? resetFormik.errors.newPassword : undefined}
                        />

                        <FormInput
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            type="password"
                            label="Confirme a Nova Senha"
                            placeholder="********"
                            value={resetFormik.values.confirmNewPassword}
                            onChange={resetFormik.handleChange}
                            onBlur={resetFormik.handleBlur}
                            error={resetFormik.touched.confirmNewPassword ? resetFormik.errors.confirmNewPassword : undefined}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={resetFormik.isSubmitting}
                        >
                            {resetFormik.isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
                        </Button>
                    </form>
                );

            case RecoveryStep.SUCCESS:
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

                        <h3 className="text-lg font-semibold">Senha Redefinida com Sucesso!</h3>

                        <p className="text-sm text-gray-600">
                            Sua senha foi redefinida. Agora você pode fazer login com sua nova senha.
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
                    <h1 className="text-3xl font-bold text-gray-800">Recuperação de Senha</h1>
                    <p className="text-gray-600">Recupere o acesso à sua conta</p>
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

export default RecoveryPasswordPage;

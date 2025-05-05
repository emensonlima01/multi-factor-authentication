import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  OtpSetupRequest,
  OtpVerificationRequest,
  RecoveryPasswordRequest,
  RegisterRequest,
  ResetPasswordRequest
} from '../types/auth';

// Configuração do axios com a URL base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL da API .NET vinda do .env
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para incluir o token de autenticação nos headers das requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Serviço de autenticação
const authService = {
  // Login com e-mail e senha
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      if (response.data.token && !response.data.requiresMfa) {
        localStorage.setItem('auth_token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  // Verificação do código OTP
  async verifyOtp(verificationData: OtpVerificationRequest): Promise<AuthResponse> {
    try {
      console.log('Enviando verificação OTP:', {
        email: verificationData.email,
        otpCode: verificationData.otpCode
      });

      const response = await api.post<AuthResponse>('/auth/verify-otp', verificationData);

      console.log('Resposta da verificação OTP:', response.data);

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao verificar código OTP:', error);
      throw error;
    }
  },

  // Registro de novo usuário
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar novo usuário:', error);
      throw error;
    }
  },

  // Configuração do MFA - validação do código OTP durante registro/setup
  async setupMfa(setupData: OtpSetupRequest): Promise<AuthResponse> {
    try {
      console.log('Enviando validação OTP para:', setupData.email);
      const response = await api.post<AuthResponse>('/auth/verify-otp', setupData);

      // Se o token foi retornado, armazená-lo localmente
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao configurar MFA:', error);
      throw error;
    }
  },

  // Obtenção do QR Code para configuração do MFA
  async getMfaSetup(email: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>(`/auth/mfa-setup?email=${email}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter configuração do MFA:', error);
      throw error;
    }
  },

  // Solicitação de recuperação de senha
  async recoverPassword(recoveryData: RecoveryPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/recover-password', recoveryData);
      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      throw error;
    }
  },

  // Redefinição de senha após validação do OTP
  async resetPassword(resetData: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Obter token atual
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};

export default authService;

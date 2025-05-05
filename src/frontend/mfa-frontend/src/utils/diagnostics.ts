// filepath: d:\Projetos\GitHub\multi-factor-authentication\src\frontend\mfa-frontend\src\utils\diagnostics.ts
// diagnostics.ts
import authService from '../services/authService';
import type { LoginRequest } from '../types/auth';

// URL base da API
const BASE_URL = 'http://localhost:5073/api';

interface DiagnosticResult {
  status: 'success' | 'error';
  message: string;
  details?: any;
}

/**
 * Verifica a conectividade com o servidor backend
 */
export const checkServerConnection = async (): Promise<DiagnosticResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Tenta fazer uma requisi��o simples para o backend
    await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return {
      status: 'success',
      message: 'Conex�o com o servidor estabelecida com sucesso'
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.name === 'AbortError'
        ? 'Tempo limite excedido ao tentar conectar com o servidor'
        : `Erro ao conectar com o servidor: ${error.message}`,
      details: error
    };
  }
};

/**
 * Verifica o fluxo de autentica��o completo
 */
export const checkAuthFlow = async (email: string, password: string): Promise<DiagnosticResult> => {
  try {
    const credentials: LoginRequest = { email, password };
    const loginResponse = await authService.login(credentials);

    return {
      status: 'success',
      message: loginResponse.requiresMfa
        ? 'Autentica��o requer MFA, como esperado'
        : 'Autentica��o sem MFA realizada com sucesso',
      details: {
        requiresMfa: loginResponse.requiresMfa,
        token: !!loginResponse.token,
      }
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: `Erro no fluxo de autentica��o: ${error.message}`,
      details: error.response?.data || error
    };
  }
};

/**
 * Executa uma s�rie de verifica��es para diagnosticar problemas
 */
export const runSystemDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // Verificar conex�o com o servidor
  const connectionResult = await checkServerConnection();
  results.push(connectionResult);

  // Se a conex�o falhou, n�o adianta continuar
  if (connectionResult.status === 'error') {
    return results;
  }

  // Adicionar mais verifica��es conforme necess�rio...

  return results;
};

/**
 * Verifica se h� problemas com CORS
 */
export const checkCorsConfiguration = async (): Promise<DiagnosticResult> => {
  try {
    // Tenta fazer uma requisi��o que testaria CORS
    await fetch(`${BASE_URL}/api/auth/status`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET'
      }
    });

    return {
      status: 'success',
      message: 'Configura��o de CORS parece estar correta'
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: `Poss�vel problema de CORS detectado: ${error.message}`,
      details: error
    };
  }
};

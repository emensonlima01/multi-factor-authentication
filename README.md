# Multi-Factor Authentication (MFA) com OTP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Visão Geral

Este projeto implementa um sistema de **Login e Cadastro de Usuários com Autenticação Multifator (MFA)** utilizando códigos **OTP (One-Time Password)**. O objetivo é fornecer uma solução de acesso segura, intuitiva, eficiente e sem depender de serviços externos como envio de e-mails.

A aplicação é dividida em:

*   **Frontend**: Interface de usuário construída com React e TypeScript, gerenciado pelo PNPM e configurado com Vite.
*   **Backend**: API RESTful desenvolvida com .NET 9.
*   **Banco de Dados**: MongoDB para persistência de dados.

O sistema é projetado com foco na experiência do usuário, segurança e escalabilidade.

## Objetivo do Negócio

Os objetivos principais desta funcionalidade incluem:

1.  **Facilitar o acesso ao sistema**: Garantir uma interface de login e cadastro simples, prática e acessível.
2.  **Aumentar a segurança**: Proteger o sistema contra acessos não autorizados com MFA via OTP.
3.  **Promover o crescimento da base de usuários**: Eliminar barreiras no processo de cadastro.
4.  **Reduzir custos operacionais**: Utilizar soluções internas sem dependência de serviços de e-mail.
5.  **Conformidade com boas práticas de segurança**: Assegurar conformidade com as melhores práticas de mercado.

## Público-Alvo

*   **Usuários Existentes**: Indivíduos que já possuem cadastro e acessam o sistema.
*   **Novos Usuários**: Pessoas interessadas em criar uma conta na plataforma.

## Funcionalidades Principais

### 1. Tela de Login

*   **Campos Necessários**:
    *   E-mail ou Nome de Usuário.
    *   Senha.
    *   Código OTP (MFA) - exibido após validação inicial.
*   **Ações Disponíveis**:
    *   **Botão "Entrar"**: Valida credenciais, solicita OTP (Google Authenticator, Authy, etc.) e redireciona após sucesso.
    *   **Link "Esqueci Minha Senha"**: Redireciona para o fluxo de recuperação.
*   **Mensagens de Feedback**: Informa sobre erros (credenciais, OTP) ou bloqueio de conta.
*   **Segurança**:
    *   Bloqueio temporário após 5 tentativas falhas.
    *   Opção "Lembrar-me" (até 30 dias).
    *   Token de autenticação criptografado.

### 2. Tela de Cadastro de Usuário

*   **Fluxo de Cadastro**:
    1.  **Coleta de Dados**: Nome completo, E-mail (único), Senha (mínimo 8 caracteres, maiúscula, minúscula, número), Confirmação de senha.
    2.  **Configuração de MFA**: Exibição de QR Code para app autenticador e validação com OTP gerado.
    3.  **Aceite dos Termos**: Checkbox obrigatório para Termos de Uso e Política de Privacidade.
    4.  **Finalização**: Redirecionamento para login após sucesso.
*   **Mensagens de Feedback**: Informa sobre e-mail duplicado, senhas não coincidentes, OTP inválido, campos obrigatórios.
*   **Validação em Tempo Real**: Feedback dinâmico durante o preenchimento.
*   **Interface Responsiva**: Adaptável a desktops, tablets e celulares.

### 3. Fluxo de Recuperação de Senha

Como o sistema não utiliza envio de e-mails, o processo é baseado em dados cadastrais e MFA:

1.  Solicitação de dados cadastrais (ex: Nome completo, Data de nascimento).
2.  Exibição de QR Code para configurar novo MFA após validação dos dados.
3.  Solicitação de nova senha e confirmação.
4.  Mensagem de sucesso e redirecionamento para login.

## Tecnologias e Ferramentas Utilizadas

### Frontend
*   **Framework**: React com TypeScript
*   **Gerenciador de Pacotes**: PNPM
*   **Ferramenta de Build**: Vite
*   **Estilização**: TailwindCSS (ou CSS-in-JS)
*   **Comunicação API**: Axios
*   **Componente OTP**: `react-otp-input` (ou similar)

### Backend
*   **Framework**: .NET 9
*   **Banco de Dados**: MongoDB
*   **Autenticação**: JWT (JSON Web Tokens)
*   **Geração OTP**: `OtpNet` (padrão TOTP - RFC 6238)
*   **Hashing de Senha**: bcrypt
*   **Bibliotecas Complementares**: `MongoDB.Driver`, `System.IdentityModel.Tokens.Jwt`

### Infraestrutura (Sugestões)
*   **Deploy Frontend**: Vercel, Netlify
*   **Deploy Backend**: Azure App Service, AWS Lambda
*   **Banco de Dados**: MongoDB Atlas (ou cluster local)

## Arquitetura de Software

### Frontend (`./src/frontend/mfa-frontend`)

*   **Estrutura de Pastas**:
    ```
    src/
      components/       -> Componentes reutilizáveis (FormInput, OTPInput, etc.)
      pages/            -> Páginas (LoginPage, RegisterPage, DashboardPage)
      services/         -> Comunicação com API (AuthService.ts)
      hooks/            -> Hooks customizados (useForm, useAuth)
      context/          -> Contexto global (AuthContext)
      utils/            -> Funções utilitárias (validações)
      styles/           -> Estilização global ou config Tailwind
    ```
*   **Principais Componentes**:
    *   `LoginPage`: Formulário de login com campos para e-mail, senha e OTP.
    *   `RegisterPage`: Formulário de cadastro com coleta de dados e configuração de MFA (QR Code).
    *   `OTPInput`: Componente para entrada de código OTP.
    *   `FeedbackModal`: Exibição de mensagens de sucesso/erro.
*   **Fluxo Principal**:
    *   **Login**: Usuário insere credenciais -> Backend valida -> Frontend solicita OTP -> Backend valida OTP -> Redirecionamento.
    *   **Cadastro**: Usuário insere dados -> Configura MFA (QR Code) -> Backend valida OTP inicial -> Cria conta -> Redirecionamento para login.

### Backend (`./src/backend/MFAApi`)

*   **Estrutura de Pastas**:
    ```
    src/
      Controllers/      -> Controladores de API (AuthController)
      Services/         -> Lógica de negócios (AuthService, OTPService, MongoDBService)
      Models/           -> Modelos de dados (User, OtpLog) e DTOs
      Utils/            -> Funções utilitárias (geração OTP, hashing)
      Middleware/       -> Tratamento de erros (CustomExceptionFilter)
    ```
*   **Principais Endpoints**:
    *   `POST /api/auth/login`: Valida credenciais, retorna JWT, solicita OTP.
    *   `POST /api/auth/verify-otp`: Valida OTP, retorna sessão.
    *   `POST /api/auth/register`: Recebe dados, gera QR Code, salva usuário após validação de OTP.
    *   `POST /api/auth/recover-password`: Valida dados cadastrais, permite redefinição de senha via OTP.
    *   `GET /api/auth/mfa-setup`: Retorna QR Code para configuração inicial.
    *   `POST /api/auth/mfa-validate`: Valida OTP do app autenticador.
*   **Modelo de Dados no MongoDB**:
    *   **Usuário (`users`)**: `_id`, `name`, `email`, `passwordHash`, `mfaSecret`, `createdAt`, `updatedAt`.
    *   **OTP Logs (`otp_logs`)**: `_id`, `userId`, `otpCode`, `expiresAt`, `validated`.

## Fluxos Técnicos

### Autenticação com MFA
1.  Login no frontend.
2.  Backend valida e-mail/senha, retorna JWT.
3.  Frontend solicita OTP.
4.  Backend valida OTP usando `mfaSecret` do usuário.
5.  Sessão criada e retornada ao frontend.

### Geração de OTP
*   Uso da biblioteca `OtpNet` para gerar/validar códigos TOTP (RFC 6238).
*   `mfaSecret` armazenado no banco durante o cadastro.

## Requisitos Não-Funcionais

1.  **Segurança**:
    *   Hashing de senhas com `bcrypt`.
    *   Comunicação via HTTPS.
    *   Tokens JWT com expiração curta.
    *   Geração local de OTP (TOTP - RFC 6238).
    *   Mitigação de ataques de força bruta (rate limiting, CAPTCHA opcional).
2.  **Performance**:
    *   Tempo de resposta do login < 2 segundos.
    *   Validação de OTP < 1 segundo.
    *   Latência do backend < 200ms para endpoints críticos.
    *   Carregamento do frontend < 2 segundos.
3.  **Acessibilidade**:
    *   Compatibilidade com leitores de tela e navegação por teclado.
    *   Padrões de contraste adequados.
4.  **Escalabilidade**:
    *   Sistema deve suportar aumento gradual de usuários.
    *   Banco de dados com índices adequados.

## Métricas de Sucesso

1.  **Taxa de Conversão no Cadastro**: Percentual de usuários que completam o cadastro.
2.  **Adoção do MFA**: Percentual de usuários que configuram e usam MFA.
3.  **Redução de Tentativas de Login Não Autorizadas**: Diminuição de bloqueios por tentativas maliciosas.
4.  **Satisfação do Usuário**: Feedback positivo sobre a usabilidade.

## Configuração e Execução

### Pré-requisitos
*   Node.js (com PNPM)
*   .NET SDK 9
*   MongoDB (local ou Atlas)

### Backend
```powershell
# Navegue até a pasta do backend
cd src/backend/MFAApi

# Restaure as dependências
dotnet restore

# Configure as variáveis de ambiente (ex: connection string do MongoDB em appsettings.Development.json)
# Exemplo appsettings.Development.json:
# {
#   "Logging": { ... },
#   "AllowedHosts": "*",
#   "MongoDBSettings": {
#     "ConnectionString": "mongodb://localhost:27017",
#     "DatabaseName": "MFAAuthDB"
#   },
#   "JwtSettings": {
#     "Secret": "SUA_CHAVE_SECRETA_SUPER_LONGA_E_SEGURA_AQUI", // Troque por uma chave segura
#     "Issuer": "MFAApi",
#     "Audience": "MFAFrontend"
#   }
# }


# Execute a API
dotnet run
```

### Frontend
```powershell
# Navegue até a pasta do frontend
cd src/frontend/mfa-frontend

# Instale as dependências
pnpm install

# Configure a URL da API (ex: em um arquivo .env ou diretamente em src/services/authService.ts)
# Exemplo: VITE_API_BASE_URL=http://localhost:5000/api (verifique a porta da sua API .NET)

# Execute a aplicação
pnpm dev
```

## Licença

Este projeto está licenciado sob a [Licença MIT](./LICENSE).

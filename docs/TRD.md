# Documento de Requisitos Técnicos (TRD)

## Tela de Login e Cadastro de Usuário com MFA (OTP)

---

### Visão Geral
Este documento traduz o **PRD (Documento de Requisitos de Produto)** em especificações técnicas para a implementação da tela de login e cadastro de usuários com MFA (OTP). O projeto será desenvolvido utilizando as seguintes tecnologias:

- **Frontend**: React com TypeScript, gerenciado pelo PNPM e configurado com Vite.
- **Backend**: .NET 9 com API RESTful.
- **Banco de Dados**: MongoDB para armazenamento de dados persistentes.

---

### Tecnologias e Ferramentas Utilizadas

#### **Frontend**
- **Framework**: React com TypeScript (para modularidade e tipagem estática).
- **Gerenciador de Pacotes**: PNPM (para melhor performance e gerenciamento eficiente de dependências).
- **Ferramenta de Build**: Vite (para um ambiente de desenvolvimento rápido e leve).
- **Estilização**: TailwindCSS ou CSS-in-JS (opcional, conforme a decisão da equipe).
- **Autenticação**: Utilização de bibliotecas como `react-otp-input` para entrada do OTP e `axios` para comunicação com o backend.

#### **Backend**
- **Framework**: .NET 9 (para construção de APIs REST modernas e performáticas).
- **Banco de Dados**: MongoDB (com suporte a coleções para usuários, tokens de sessão, e logs de auditoria).
- **Autenticação e MFA**:
  - Implementação de autenticação via JWT (JSON Web Tokens).
  - Geração de OTP baseada no padrão TOTP (RFC 6238).
- **Bibliotecas Complementares**:
  - `MongoDB.Driver` para interação com o banco.
  - `System.IdentityModel.Tokens.Jwt` para geração e validação de tokens JWT.
  - `OtpNet` para geração e validação de códigos OTP.

#### **Infraestrutura**
- **Deploy do Frontend**: Vercel ou Netlify.
- **Deploy do Backend**: Azure App Service ou AWS Lambda (opcional, dependendo do orçamento e escalabilidade).
- **Banco de Dados**: MongoDB Atlas (gerenciado na nuvem) ou um cluster local.

---

### Arquitetura de Software

#### **Frontend (React com TypeScript)**
- **Estrutura de Pastas**:
  ```
  src/
    components/       -> Componentes reutilizáveis (ex.: FormInput, OTPInput, etc.)
    pages/            -> Páginas do sistema (LoginPage, RegisterPage)
    services/         -> Comunicação com APIs (ex.: AuthService.ts)
    hooks/            -> Hooks customizados (ex.: useForm, useAuth)
    context/          -> Contexto global para autenticação e estado do usuário
    utils/            -> Funções utilitárias (ex.: validações de senha, formatação de dados)
    styles/           -> Estilização global ou TailwindCSS config
  ```

- **Principais Componentes**:
  1. **LoginPage**:
     - Formulário com campos de entrada para e-mail, senha e OTP.
     - Validação em tempo real e feedback visual para erros.
     - Botão "Entrar" que chama o serviço de autenticação no backend via `AuthService`.

  2. **RegisterPage**:
     - Formulário para entrada de dados do usuário (nome, e-mail, senha, confirmação de senha).
     - Exibição de QR Code para configuração do MFA.
     - Validação do OTP gerado pelo aplicativo autenticador.
     - Botão "Cadastrar" que envia os dados para o backend.

  3. **OTPInput**:
     - Componente reutilizável para entrada de códigos OTP (como `react-otp-input`).

  4. **FeedbackModal**:
     - Modal para exibir mensagens de sucesso ou erro.

- **Fluxo Principal do Frontend**:
  - **Login**:
    1. O usuário insere e-mail e senha.
    2. Caso as credenciais estejam corretas, o backend retorna um token JWT e solicita o código OTP.
    3. O usuário insere o código OTP, que é validado no backend.
    4. Após validação, o usuário é redirecionado à página principal (dashboard).
  - **Cadastro**:
    1. O usuário insere informações pessoais e configura o MFA escaneando um QR Code.
    2. O backend valida o código OTP inicial e cria a conta no MongoDB.
    3. Após sucesso, o usuário é redirecionado para a tela de login.

---

#### **Backend (.NET 9 com MongoDB)**

- **Estrutura de Pastas**:
  ```
  src/
    Controllers/      -> Controladores de API (AuthController, UserController)
    Services/         -> Lógica de negócios e acesso a dados (AuthService, OTPService, UserRepository)
    Models/           -> Modelos de dados (User, OTP, etc.) e DTOs
    Utils/            -> Funções utilitárias (ex.: geração de OTP, hashing de senhas)
    Middleware/       -> Middleware para autenticação e tratamento de erros
  ```

- **Principais Endpoints**:
  1. **Autenticação**:
     - `POST /api/auth/login`:
       - Validação de e-mail e senha.
       - Retorna um token JWT e solicita o OTP.
     - `POST /api/auth/verify-otp`:
       - Valida o código OTP enviado pelo usuário.
       - Retorna informações de sessão em caso de sucesso.
  2. **Cadastro**:
     - `POST /api/auth/register`:
       - Recebe informações do usuário (nome, e-mail, senha).
       - Gera um QR Code para configuração do MFA.
       - Salva os dados no banco após validação do OTP.
  3. **Recuperação de Senha**:
     - `POST /api/auth/recover-password`:
       - Valida dados cadastrais fornecidos pelo usuário.
       - Permite redefinição de senha após validação do OTP.
  4. **Configuração do MFA**:
     - `GET /api/auth/mfa-setup`:
       - Retorna um QR Code para configuração inicial do MFA.
     - `POST /api/auth/mfa-validate`:
       - Valida o código OTP gerado no aplicativo autenticador.

- **Modelo de Dados no MongoDB**:
  - **Usuário (`users`)**:
    ```json
    {
      "_id": "ObjectId",
      "name": "string",
      "email": "string",
      "passwordHash": "string",
      "mfaSecret": "string",
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
    ```
  - **OTP Logs (`otp_logs`)**:
    ```json
    {
      "_id": "ObjectId",
      "userId": "ObjectId",
      "otpCode": "string",
      "expiresAt": "ISODate",
      "validated": "boolean"
    }
    ```

---

### Fluxos Técnicos

#### **Autenticação com MFA**
1. O usuário faz login no frontend.
2. O backend valida e-mail e senha e retorna um token JWT.
3. O frontend solicita o código OTP.
4. O backend valida o código OTP usando o segredo armazenado no banco de dados.
5. Após sucesso, a sessão é criada e retornada ao frontend.

#### **Geração de OTP**
- Utilizar a biblioteca `OtpNet` para geração e validação de códigos OTP baseados no padrão TOTP.
- O segredo do usuário será armazenado no banco no momento do cadastro.

---

### Requisitos Não-Funcionais

1. **Segurança**:
   - Hashing de senhas usando `bcrypt`.
   - Comunicação via HTTPS entre frontend e backend.
   - Tokens JWT com expiração curta para autenticação.
   - Proteção contra ataques de força bruta (limitação de tentativas de login).

2. **Performance**:
   - Backend deve responder com latência máxima de 200ms para endpoints críticos.
   - Frontend deve carregar em menos de 2 segundos em conexões padrão.

3. **Escalabilidade**:
   - Backend preparado para suportar aumento no número de requisições.
   - Banco de dados com índices adequados para consultas rápidas.

4. **Acessibilidade**:
   - Garantir que o frontend seja acessível para leitores de tela e navegadores modernos.

---

### Considerações Finais
Este TRD detalha os aspectos técnicos necessários para implementar a tela de login e cadastro com MFA (OTP). A arquitetura é flexível, segura e escalável, garantindo uma experiência de usuário fluida e eficiente. A implementação seguirá as melhores práticas de desenvolvimento para garantir qualidade e segurança.

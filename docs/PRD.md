# Documento de Requisitos de Produto (PRD)

## Tela de Login e Cadastro de Usuário com MFA (OTP)

---

### Visão Geral
Este documento detalha os requisitos para a implementação de uma interface de login e cadastro de usuários, incorporando autenticação multifator (MFA) baseada em códigos OTP (One-Time Password). A solução será projetada para oferecer uma experiência de acesso segura, intuitiva, eficiente e sem dependências externas como envio de e-mails. Essa funcionalidade é essencial para proteger acessos ao sistema e facilitar a adesão de novos usuários.

O sistema será desenvolvido com foco na experiência do usuário, na segurança e na escalabilidade, permitindo que ele suporte crescimento futuro sem comprometer a performance ou a usabilidade.

---

### Objetivo do Negócio

Os objetivos principais desta funcionalidade incluem:

1. **Facilitar o acesso ao sistema**: Garantir uma interface de login e cadastro simples, prática e acessível a todos os usuários.
2. **Aumentar a segurança**: Proteger o sistema contra acessos não autorizados por meio da implementação de autenticação multifator com OTP.
3. **Promover o crescimento da base de usuários**: Eliminar barreiras no processo de cadastro para incentivar a adesão de novos usuários.
4. **Reduzir custos operacionais**: Utilizar soluções internas para autenticação e gerenciamento de usuários, eliminando a necessidade de serviços externos, como envio de e-mails.
5. **Conformidade com boas práticas de segurança**: Assegurar que o sistema esteja em conformidade com as melhores práticas de mercado, protegendo os dados dos usuários e reduzindo riscos.

---

### Público-Alvo

- **Usuários Existentes**:
  Indivíduos que já possuem cadastro e acessam o sistema regularmente.

- **Novos Usuários**:
  Pessoas interessadas em criar uma conta para utilizar os serviços oferecidos pela plataforma.

---

### Funcionalidades Principais

#### **1. Tela de Login**

##### **Requisitos Funcionais**
- **Campos Necessários**:
  - **E-mail ou Nome de Usuário**: Campo de texto para entrada das credenciais do usuário.
  - **Senha**: Campo de senha para autenticação.
  - **Código OTP (MFA)**: Campo opcional que será exibido após validação inicial do e-mail/usuário e senha.

- **Ações Disponíveis**:
  - **Botão "Entrar"**:
    1. Realiza a validação das credenciais fornecidas.
    2. Após autenticação de e-mail/usuário e senha, solicita o código OTP gerado por um aplicativo autenticador (Google Authenticator, Authy, etc.).
    3. Após validação do OTP, redireciona o usuário para o dashboard ou a página principal do sistema.
  - **Link "Esqueci Minha Senha"**:
    - Redireciona para um fluxo de redefinição de senha (detalhado na seção “Fluxo de Recuperação de Senha”).

- **Mensagens de Feedback**:
  - "Usuário ou senha incorretos."
  - "Código OTP inválido."
  - "Sua conta está bloqueada após múltiplas tentativas falhas. Por favor, tente novamente após X minutos."

- **Requisitos de Segurança**:
  - Bloqueio temporário da conta após 5 tentativas de login falhas consecutivas, com feedback ao usuário.
  - Opção de "Lembrar-me" para manter a sessão ativa por um período configurável (máximo de 30 dias).
  - Token de autenticação criptografado para proteger sessões persistentes.

---

#### **2. Tela de Cadastro de Usuário**

##### **Requisitos Funcionais**
- **Fluxo de Cadastro**:
  1. **Coleta de Dados Pessoais**:
     - Nome completo.
     - E-mail (único no sistema).
     - Senha (mínimo de 8 caracteres, contendo ao menos uma letra maiúscula, uma letra minúscula e um número).
     - Confirmação de senha.
  2. **Configuração de MFA**:
     - Um QR Code será exibido para que o usuário configure o MFA em aplicativos autenticadores (Google Authenticator, Authy, etc.).
     - O usuário deverá inserir um código OTP gerado para validar a configuração.
  3. **Aceite dos Termos e Condições**:
     - Checkbox obrigatório para confirmar a aceitação dos Termos de Uso e da Política de Privacidade.
  4. **Finalização do Cadastro**:
     - Após validação do MFA, o usuário será redirecionado para a tela de login com uma mensagem de sucesso: "Cadastro concluído com sucesso. Por favor, faça login para acessar o sistema."

- **Mensagens de Feedback**:
  - "E-mail já cadastrado no sistema."
  - "As senhas não coincidem."
  - "O código OTP é inválido. Por favor, tente novamente."
  - "Todos os campos obrigatórios devem ser preenchidos."

- **Validação em Tempo Real**:
  - Mensagens de feedback exibidas dinamicamente enquanto o usuário preenche o formulário (ex.: "Senha forte", "Formato de e-mail inválido").

- **Interface Responsiva**:
  - Garantir que o formulário seja adaptável para diferentes dispositivos, incluindo desktops, tablets e celulares.

---

### Fluxo de Recuperação de Senha

Como o sistema não utiliza envio de e-mails, o processo de redefinição de senha será baseado em dados cadastrais e validação via MFA:

1. O usuário será solicitado a informar:
   - Nome completo.
   - Data de nascimento ou outro dado cadastral previamente registrado.
2. Após validação dos dados, o sistema exibirá um QR Code para configurar um novo MFA.
3. O usuário será solicitado a criar uma nova senha e confirmá-la.
4. Mensagem final: "Sua senha foi redefinida com sucesso. Por favor, faça login com sua nova senha."

---

### Requisitos Não-Funcionais

1. **Segurança**:
   - Utilizar hashing robusto para armazenar senhas (ex.: bcrypt).
   - Implementar MFA com geração local de códigos OTP (conforme padrão TOTP baseado no RFC 6238).
   - Mitigar ataques de força bruta e automações maliciosas (CAPTCHA, rate limiting).
   - Garantir que toda comunicação seja realizada via HTTPS.

2. **Performance**:
   - O tempo de resposta para validação de login não deve exceder 2 segundos.
   - A geração de QR Codes e validação de OTP deve ser instantânea (tempo inferior a 1 segundo).

3. **Acessibilidade**:
   - Compatibilidade com leitores de tela e navegação por teclado.
   - Padrões de contraste e usabilidade adequados para usuários com deficiência visual.

4. **Escalabilidade**:
   - O sistema deve suportar aumento gradual de usuários sem comprometer a performance.

---

### Métricas de Sucesso

1. **Taxa de Conversão no Cadastro**:
   - Percentual de usuários que iniciam e completam o cadastro.
2. **Adoção do MFA**:
   - Percentual de usuários que configuram e utilizam o MFA corretamente.
3. **Redução de Tentativas de Login Não Autorizadas**:
   - Diminuição no número de bloqueios por tentativas maliciosas de login.
4. **Satisfação do Usuário**:
   - Feedbacks positivos sobre a facilidade de uso das telas de login e cadastro.

---

### Proposta de Design (Wireframe)

#### Tela de Login
1. **Layout**:
   - Campos de entrada centralizados.
   - Botão "Entrar" destacado.
   - Link "Esqueci minha senha" abaixo dos campos de login.
   - Campo de OTP exibido somente após validação inicial do e-mail/usuário e senha.
2. **Feedback Visual**:
   - Cores para mensagens de sucesso (verde) e erro (vermelho).
   - Indicadores de progresso durante validação.

#### Tela de Cadastro
1. **Layout**:
   - Formulário dividido em seções claras (dados pessoais, configuração de MFA, termos de uso).
   - QR Code destacado para configuração do MFA.
   - Botão "Concluir Cadastro" habilitado após preenchimento completo e validação de todos os dados.
2. **Feedback Visual**:
   - Mensagens de erro exibidas diretamente nos campos relevantes.
   - Indicadores de força da senha para orientar os usuários.

---

### Considerações Finais

A funcionalidade de login e cadastro com MFA é essencial para garantir segurança, escalabilidade e uma experiência fluida para os usuários. A ausência de serviços externos reduz custos e simplifica a infraestrutura, enquanto o uso de OTP eleva o nível de proteção contra acessos não autorizados. A implementação deve seguir os padrões mais recentes de segurança e acessibilidade, alinhando-se às melhores práticas de mercado e garantindo a satisfação do usuário.

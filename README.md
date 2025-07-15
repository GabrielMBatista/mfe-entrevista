# Microfrontend de Entrevista

## Objetivo
Este microfrontend é responsável por gerenciar entrevistas interativas, incluindo gravação de áudio e exibição de perguntas e respostas.

## Instalação de Dependências
1. Certifique-se de ter o Node.js instalado.
2. Execute o comando:
   ```bash
   npm install
   ```

## Variáveis de Ambiente
Configure as seguintes variáveis no arquivo `.env`:
- `NEXT_PUBLIC_SHELL_REMOTE_URL`: URL do shell principal.
- `NEXT_PUBLIC_MFE_CHATBOT_URL`: URL do microfrontend de chatbot.
- `NEXT_PUBLIC_API_BASE_URL`: URL base da API.

## Execução Local
1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse o microfrontend em `http://localhost:3000`.

## Build
Para gerar o build de produção:
```bash
npm run build
```

## Integração com o Shell Principal
1. Certifique-se de que o shell principal está configurado para consumir este microfrontend.
2. Configure o `NEXT_PUBLIC_SHELL_REMOTE_URL` com a URL do shell principal.
3. Importe e utilize o microfrontend conforme necessário.


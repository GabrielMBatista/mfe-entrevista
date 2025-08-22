# Microfrontend de Entrevista

## Objetivo
Este microfrontend é responsável por gerenciar entrevistas interativas, incluindo gravação de áudio e exibição de perguntas e respostas.

## Estrutura do Projeto
```
├── src
│   ├── components/      # Componentes React reutilizáveis (configurações, entrevistas, dashboard etc.)
│   ├── hooks/           # Hooks customizados
│   ├── lib/             # Funções utilitárias e serviços de API
│   ├── pages/           # Rotas do Next.js (dashboard, home, interview, invite...)
│   ├── styles/          # Estilos globais e temas
│   ├── types/           # Definições de tipos e declarações
│   └── utils/           # Utilitários gerais
├── next.config.js       # Configuração do Next.js e Module Federation
├── tailwind.config.ts   # Configuração do Tailwind CSS
├── postcss.config.mjs   # Ajustes do PostCSS
└── tsconfig.json        # Configuração do TypeScript
```

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

## Exemplos de Código e Uso

### Hook de filtros de entrevista
```tsx
import { useInterviewFilters } from '@/hooks/useInterviewFilters';

export function ListaEntrevistas() {
  const { filters, handleFilterChange, resetFilters } = useInterviewFilters();

  return (
    <div>
      <input
        value={filters.status || ''}
        onChange={(e) => handleFilterChange('status', e.target.value)}
      />
      <button onClick={resetFilters}>Limpar filtros</button>
    </div>
  );
}
```

### Iniciando uma sessão de entrevista via API
```ts
import { createSession } from '@/lib/api';

async function iniciarSessao(invitationId: string) {
  const session = await createSession(invitationId, new Date().toISOString());
  console.log('Sessão criada:', session.id);
}
```

### Consumindo o microfrontend no shell
```tsx
import dynamic from 'next/dynamic';

const InterviewApp = dynamic(() => import('mfe-entrevista/App'), { ssr: false });

export default function ShellPage() {
  return <InterviewApp />;
}
```

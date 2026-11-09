# Hospital Flow

Sistema demonstrativo de gestão de atendimento em pronto-socorro (React + TypeScript + Tailwind CSS + Lucide).
Sem backend: os dados ficam no `localStorage` do navegador. A classificação de risco é apenas demonstrativa.

## Executar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Para gerar a versão de produção: `npm run build` (saída em `dist/`).

## Publicar na Vercel

1. Envie o projeto para um repositório no GitHub e importe em vercel.com/new (preset Vite detectado automaticamente), ou
2. Pelo terminal: `npm i -g vercel` e depois `vercel --prod`.

Build command: `npm run build` · Output directory: `dist`.

# silasmoreira.tech

Site pessoal de Silas Moreira, publicado com GitHub Pages.

- Domínio: silasmoreira.tech (ficheiro CNAME)
- Formulário: FormSubmit (código aleatório) · Estatísticas: Umami, só com consentimento.

## Chaves e segredos

O site é estático: tudo o que está neste repositório é público, no GitHub e no browser de quem visita.

- **Nunca** colocar aqui chaves privadas (API da Brevo `xkeysib-…`, Umami API, tokens do GitHub, OpenAI, etc.). Se um dia for preciso usar uma, ela tem de viver num servidor ou num Cloudflare Worker, nunca no HTML/JS.
- Os identificadores que aparecem no código são públicos por desenho e não dão acesso a nenhuma conta:
  - FormSubmit: código aleatório no lugar do email (esconde o endereço) + campo `_honey` contra spam.
  - Brevo: URL do formulário `sibforms.com` (só permite inscrever, não ler contactos).
  - Umami: ID do site, limitado a `silasmoreira.tech` com `data-domains`.
- O `.gitignore` bloqueia `.env`, `*.key`, `credentials*.json` e afins.
- Se uma chave privada for publicada por engano: revogá-la logo no serviço e gerar outra (apagar o ficheiro não chega, fica no histórico).

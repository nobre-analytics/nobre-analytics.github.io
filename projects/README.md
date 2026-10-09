# Operations panels · Painéis de operação

Four screens from an automated collections operation, recreated with **fictitious data**. Each screen is a single HTML file that runs in the browser, with no login, no server and no build step.

Quatro telas de uma operação de cobrança automatizada, recriadas com **dados fictícios**. Cada tela é um arquivo HTML único que roda no navegador, sem login, sem servidor e sem build.

> No name, CPF, contract, task code or amount on these screens is real. CPFs are masked (`•••.482.917-••`), as in production. No button saves anything.

**Live:** https://nobre-analytics.github.io/projects/

## Structure · Estrutura

```
projects/
├── index.html              landing page, EN/PT toggle, live previews
├── en/                     English version of the four screens
│   ├── painel-rejeicoes.html
│   ├── painel-fidc.html
│   ├── cerebro.html
│   └── cerebro-mobile.html
└── pt/                     versão em português das quatro telas
    └── (same four files)
```

The landing page opens in English by default, in Portuguese for visitors whose browser is in Portuguese, and can be forced with `?lang=en` or `?lang=pt`. The choice is shared with the portfolio.

## The screens · As telas

| File | What it shows |
|---|---|
| `painel-rejeicoes.html` | Rejected payments, already diagnosed, split into queues by the decision they need. Payment-path dashboard, simulated write-off bot with a live log, and Grind mode (one case at a time, shortcuts J, K and X). |
| `painel-fidc.html` | Refunds of duplicate payments, matched against the gateway statement. Operation mode for who executes, curation mode for who decides what goes into the batch. |
| `cerebro.html` | The Brain, monitor of the collector bot fleet: whether the morning closed, how much came in, what failed. Detail drawer, Ctrl K navigation, collections by channel and days past due. |
| `cerebro-mobile.html` | The Brain redesigned for mobile. On desktop it shows inside a phone frame with notes on what changed; on a phone it fills the screen. |

## Built with · Feito com

Plain HTML, CSS and JavaScript. Fonts Bree Serif and Open Sans (Google Fonts). Light and dark theme on every screen; the choice carries across all four.

## Author · Autor

Paulo Nobre · [Portfolio](https://nobre-analytics.github.io/) · [LinkedIn](https://www.linkedin.com/in/paulo-nobre-/)

# Tessera

A real-time, two-player strategy game where you compete to build the most valuable mosaic while racing your opponent across a shared time board.

## Gameplay

Each player has a personal 9×9 grid to fill with glass tiles. The player furthest behind on the shared 54-space time board always acts next, so spending time wisely is as important as picking the right tiles.

On your turn, choose one action:

- **Advance** — move forward one space on the time board and earn 1 gem.
- **Take a tile** — buy one of three tiles from the market, rotate/flip and place it on your mosaic, pay its gem cost, then advance by its time cost.

### Time board events

- **Gem income** (spaces 5, 11, 17, 23, 29, 35, 41, 47, 53) — earn gems equal to your tiles' total gem income.
- **Special tile** (spaces 20, 26, 32, 44, 50) — first player to reach claims a free 1×1 tile to place immediately.
- **7×7 bonus** — first player to completely fill any 7×7 area earns +7 points.

### Scoring

```
score = gems − (2 × empty cells) + (7 if 7×7 bonus earned)
```

The game ends when both players reach space 53. Highest score wins.

## Tech stack

- **Client** — React 19, Vite, TypeScript, Zustand, Immer, dnd-kit, Tailwind v4
- **Multiplayer** — PartyKit (WebSocket rooms) + PartySocket

## Project layout

- [src/engine/](src/engine/) — game rules, tiles, scoring, time board, types
- [src/components/](src/components/) — UI organized by feature (mosaic, tiles, time board, actions, rules, player, layout)
- [src/store/](src/store/) — Zustand state
- [src/hooks/](src/hooks/) — custom hooks
- [party/server.ts](party/server.ts) — PartyKit room server: state sync, action validation, reconnection
- [party/protocol.ts](party/protocol.ts) — client/server message types

Players connect to an isolated PartyKit room, send actions (`TAKE_TILE`, `ADVANCE`, `PLACE_SPECIAL_TILE`), and the server validates them through the engine and broadcasts updated `GameState` to both clients.

## Development

```bash
npm install
npm run dev      # runs Vite client + PartyKit dev server concurrently
npm run build
npm run lint
```

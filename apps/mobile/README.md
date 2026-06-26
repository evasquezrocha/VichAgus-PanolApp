# PanolApp Mobile

Scaffold inicial de la app Expo para offline-first.

## Lo que ya queda definido

- Contrato compartido de sincronizacion en `@panol/shared`.
- UI base para operar sin senal.
- Cola de mutaciones en memoria como punto de partida.

## Como abrirla en el telefono

Expo Go no es suficiente para este proyecto. Debes usar un development build.

1. Instala `expo-dev-client` en el dispositivo mediante un build nativo.
2. Arranca Metro con `npm run start` dentro de `apps/mobile` o `npm run mobile:dev` desde la raiz.
3. Escanea el QR desde el development build, no desde Expo Go.

## Lo que falta antes de usarla en produccion

1. Instalar dependencias de Expo.
2. Cambiar `MemoryOfflineQueueStore` por SQLite o almacenamiento persistente.
3. Conectar autenticacion y sync real.
4. Resolver conflictos de sincronizacion y reintentos.

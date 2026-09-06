# GreonTrack — Frontend

App web del Sistema Inteligente de Análisis del Consumo Energético.

## Qué hace

Interfaz donde el usuario se registra, inicia sesión, registra sus
dispositivos electrónicos, y va a poder ver su consumo estimado en kWh,
costo eléctrico y huella de carbono, con recomendaciones de ahorro.

## Stack

- React 18 + TypeScript + Vite
- React Router para las rutas
- Supabase (Auth + Postgres) — el frontend habla directo con Supabase,
  sin backend propio para esto. El único backend separado que existe en
  el proyecto es el del Agente GreonTrack, que reporta uso desde la
  laptop del usuario.

## Setup

```bash
npm install
cp .env.example .env
# Completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

## Estructura

- components/ — piezas reutilizables (Sidebar, AppShell, AuthLayout, iconos)
- pages/ — pantallas (Login, Register, Home, Devices...)
- context/ — AuthContext, maneja sesión de Supabase
- lib/ — cliente de Supabase
- types/ — tipos de TypeScript que reflejan las tablas de la base de datos

## Variables de entorno

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Notas

El registro de usuarios requiere confirmación por correo (configurado en
Supabase Auth) — si se necesita desactivar esto para pruebas o demo, se
ajusta desde el dashboard de Supabase, no desde este código.

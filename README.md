# Biblioteca (Ionic + Capacitor)

Proyecto híbrido (Web + Android) creado con Ionic Angular, migrando la app de `Libros`.

## Desarrollo web

```bash
npm install
npm run ionic:serve
```

## Build web

```bash
npm run build:web
```

El build se genera en `www/`.

## Android (Capacitor)

```bash
npm run build:web
npm run cap:sync
npm run android:open
```

## Despliegue en GitHub Pages

Este repo incluye workflow en `.github/workflows/deploy-gh-pages.yml`.

Pasos:
1. Sube el proyecto a GitHub.
2. Usa la rama `main`.
3. En GitHub, activa **Settings > Pages > Build and deployment > Source: GitHub Actions**.
4. Al hacer push a `main`, se desplegará automáticamente.

Para build manual local con base href del repo:

```bash
GH_REPO=nombre-del-repo npm run build:gh
```

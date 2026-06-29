<div align="center">
  <img src="docs/assets/neural-flow-studio-logo.svg" alt="Neural Flow Studio Logo" width="260" />
  <h1>Neural Flow Studio</h1>
  <p><b>Constructor visual de redes neuronales con TensorFlow.js y aceleracion Web</b></p>

  <p>
    <img src="https://img.shields.io/badge/Angular-v21-red?style=flat-square&logo=angular" alt="Angular" />
    <img src="https://img.shields.io/badge/TypeScript-v5.9-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/pnpm-v10%2B-orange?style=flat-square&logo=pnpm" alt="pnpm" />
    <img src="https://img.shields.io/badge/TensorFlow.js-v4.22-ff6f00?style=flat-square&logo=tensorflow" alt="TensorFlow.js" />
    <img src="https://img.shields.io/badge/WebGPU-WebGL%20%7C%20WASM%20%7C%20CPU-brightgreen?style=flat-square" alt="TensorFlow.js backends" />
  </p>
</div>

---

**Neural Flow Studio** es una aplicacion web desarrollada con Angular y TensorFlow.js para disenar, conectar, validar, entrenar y exportar redes neuronales desde un canvas visual.

La app permite construir modelos por capas, configurar hiperparametros, cargar o generar datos de entrenamiento, revisar metricas en tiempo real y cambiar el backend de ejecucion entre WebGPU, WebGL, WASM y CPU segun la compatibilidad del navegador.

---

## Documentacion

La documentacion funcional del proyecto esta en [`docs/`](./docs/README.md):

- [Guia de usuario](./docs/guia-usuario.md)
- [Arquitectura](./docs/arquitectura.md)
- [Entrenamiento y datos](./docs/entrenamiento-y-datos.md)

## Requisitos

- Node.js 18+
- pnpm 10+
- Navegador moderno con soporte para WebGPU o WebGL

## Desarrollo

Instala dependencias:

```bash
pnpm install
```

Inicia el servidor local:

```bash
pnpm start
```

Luego abre `http://localhost:4200/`.

## Build

Compila la aplicacion:

```bash
pnpm build
```

Los artefactos quedan en `dist/`.

## Tests

Ejecuta las pruebas:

```bash
pnpm test
```

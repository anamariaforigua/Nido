# Encuesta Sueño Bebés

App Next.js lista para desplegar en Vercel. Incluye:

- Encuesta pública de una pregunta por pantalla.
- Preguntas obligatorias 1 a 9 y opcionales 10 a 12.
- Lógica condicional: la pregunta 12 solo aparece si la 11 es "Sí".
- Barra de progreso.
- Panel privado en `/resultados`.
- Exportación CSV de respuestas.
- Guardado en Postgres cuando se despliega en Vercel.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Para probar el panel local:

```bash
cp .env.example .env.local
```

Cambia `ADMIN_PASSWORD` en `.env.local` y abre `http://localhost:3000/resultados`.

En local, si no hay Postgres configurado, las respuestas se guardan en `data/survey-responses.json`.

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. En Vercel, crea un nuevo proyecto desde ese repositorio.
3. Agrega una base de datos Postgres/Neon desde Vercel Storage y conéctala al proyecto.
4. En `Settings > Environment Variables`, agrega:

```bash
ADMIN_PASSWORD=una-clave-segura
```

5. Despliega.

La tabla `survey_responses` se crea automáticamente cuando llegue la primera respuesta o cuando abras `/resultados`.

## Rutas

- `/`: encuesta pública.
- `/resultados`: panel privado con métricas, respuestas individuales y descarga CSV.

## Notas de seguridad

El panel de resultados requiere `ADMIN_PASSWORD`. La encuesta es anónima, pero la pregunta 12 puede guardar WhatsApp o correo si la persona acepta conversar.

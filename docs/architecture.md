# Arquitectura de FlowSync

Diagrama de contenedores (nivel 2 de C4) de FlowSync tal y como está en el código: una SPA de React que habla por HTTP/JSON con una API de AdonisJS, y esa API que lee y escribe en un fichero SQLite. Dentro de cada contenedor se listan solo las piezas verificadas en `frontend/src` y `backend/`. No hay otros sistemas externos ni servicios: nada más se dibuja porque nada más se ha encontrado.

```mermaid
C4Container
    title FlowSync — diagrama de contenedores

    Person(user, "Miembro del equipo", "Crea, consulta y cambia el estado y el vencimiento de las tareas")

    System_Boundary(flowsync, "FlowSync") {
        Container(spa, "Frontend", "React 19, Vite 8, react-router, Tailwind v4, shadcn/ui", "SPA en :5173. Páginas: login, register, tasks, tasks/:id, profile. Toda llamada pasa por lib/api.ts; el token vive en localStorage (flowsync.token)")
        Container(api, "API", "AdonisJS 7, Lucid 22, VineJS 4, Auth 10", "REST JSON en :3333, prefijo /api/v1. Respuestas envueltas en { data } por el serializer. Guard por defecto: access tokens opacos")
        ContainerDb(db, "Base de datos", "SQLite (better-sqlite3)", "Fichero tmp/db.sqlite3. Tablas: users, auth_access_tokens, tasks")
    }

    Rel(user, spa, "Usa", "Navegador")
    Rel(spa, api, "Llama a", "HTTPS/JSON, Authorization: Bearer")
    Rel(api, db, "Lee y escribe", "Lucid / SQL")
```

## Rutas de la API (`backend/start/routes.ts`)

| Método | Ruta | Controlador | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | `NewAccountController.store` | no |
| POST | `/api/v1/auth/login` | `AccessTokensController.store` | no |
| GET | `/api/v1/account/profile` | `ProfileController.show` | sí |
| POST | `/api/v1/account/logout` | `AccessTokensController.destroy` | sí |
| GET | `/api/v1/tasks` | `TasksController.index` | sí |
| POST | `/api/v1/tasks` | `TasksController.store` | sí |
| GET | `/api/v1/tasks/:id` | `TasksController.show` | sí |
| PATCH | `/api/v1/tasks/:id/status` | `TaskStatusesController.update` | sí |
| PUT | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController.update` | sí |

## Componentes por capa

```mermaid
flowchart LR
    subgraph FE["Frontend (frontend/src)"]
        pages["pages/ (login, register, tasks, task, profile)"]
        routes["routes/ (app-routes + guards)"]
        authctx["auth/ (provider, contexto)"]
        apits["lib/api.ts"]
        pages --> apits
        authctx --> apits
        routes --> pages
    end
    subgraph BE["API (backend/app)"]
        ctrl["controllers/"]
        val["validators/ (VineJS)"]
        model["models/ (User, Task)"]
        trans["transformers/"]
        ctrl --> val
        ctrl --> model
        ctrl --> trans
    end
    schema["database/schema.ts (autogenerado desde migraciones)"]
    sqlite[("tmp/db.sqlite3")]
    apits -- "HTTP/JSON" --> ctrl
    model --> schema
    model --> sqlite
```

Los transformers son `TaskTransformer` (lista, alta y cambio de estado), `TaskDetailTransformer` (tarea suelta y vencimiento, con `isOverdue`), `TaskAssigneeTransformer` (responsable: `id`, `fullName`, `initials`) y `UserTransformer` (cuenta).

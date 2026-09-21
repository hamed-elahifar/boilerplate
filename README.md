# Boilerplate

Starting point for new applications: a NestJS + MongoDB REST API and a Vue 3 frontend, with authentication, a users module, a generic CRUD layer and Persian/English i18n. It contains no business logic. To build an app, copy this repo and add modules.

> **For AI agents:** this file is the source of truth. Read it fully, then read [CONTEXT.md](./CONTEXT.md) for vocabulary. Follow the conventions below rather than inventing new ones.

## Stack

| Layer    | Technology                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| Runtime  | Bun (workspaces: `backend`, `frontend`), Node-compatible                                     |
| Backend  | NestJS 11, Mongoose 8 (MongoDB), Passport JWT, bcryptjs, class-validator, Swagger, Winston   |
| i18n     | `nestjs-i18n`: `fa` and `en`, per request                                                    |
| Frontend | Vue 3 + Vite + TypeScript, Tailwind v4, shadcn-vue (reka-ui), vue-router, RTL, Vazirmatn font |
| Tests    | Jest + supertest e2e against a real MongoDB                                                  |
| Deploy   | PM2 (`ecosystem.config.js`, `bin/deploy.sh`) or Docker (`backend/Dockerfile`, `backend/docker-compose.yml`)   |

Not included on purpose (add when needed): GraphQL, Redis/cache, websockets, file storage, SMS/push.

## Start

Requires Bun and a MongoDB (`docker run -d -p 27017:27017 mongo`).

```bash
bun install
cp backend/env.example backend/.env   # then set JWT_SECRET
bun run --cwd backend seed            # creates admin / admin123 (dev only!)
bun run start:dev                     # backend :3003, frontend :5173 (proxies /api -> backend)
```

- Swagger: http://localhost:3003/api-doc (non-production only)
- Frontend login: `admin` / `admin123`

Other commands: `bun run build`, `bun run lint`, `bun run --cwd backend test:e2e`.

E2E tests need `backend/.env.test` (gitignored). Copy `env.example`, set `NODE_ENV=test` and a throwaway `MONGO_URL` such as `mongodb://localhost:27017/app_test`. Tests **drop that database**, so never point it at real data.

## Environment (`backend/.env`)

`NODE_ENV` (`development|production|test`), `PORT`, `MONGO_URL`, `MONGO_DEBUG`, `JWT_SECRET`, `JWT_AUDIENCE`, `JWT_ISSUER`, `JWT_EXPIRES_IN`, and optional `DEFAULT_LANGUAGE` (`fa|en`, default `fa`). Validated at boot in `backend/src/modules/common/validators/env.validation.ts`, so add new variables there.

## Backend layout (`backend/src`)

```
app.module.ts            registers ALL cross-cutting concerns (guards, pipes, filter, interceptor)
main.ts                  bootstrap only: CORS, compression, Swagger, /api prefix strip
i18n/<lang>/*.json       translation resources (validation.json, errors.json)
modules/
  auth/                  sign-up, sign-in, /auth/me; JWT strategy; guards; @Public, @Roles, @GetJwt
  users/                 ADMIN-only CRUD at /users, built on the generic layer
  common/
    generic/             BaseController(), BaseService, BaseRepository  <- the reusable core
    filters/ interceptors/ validators/ dto/ logger/ utils/
```

### Behaviour every module inherits

- **Auth by default.** A global guard requires a JWT on every route. Opt out with `@Public()`. Restrict with `@Roles(RolesEnum.ADMIN)` (class or method). Roles: `ADMIN`, `USER`.
- **Response envelope.** Success: `{ success, statusCode, data, timestamp }`. Error: `{ success: false, statusCode, error, message, timestamp }`. Clients read `data`.
- **Validation.** Global i18n validation pipe (whitelist and transform on). Put class-validator decorators on DTOs.
- **Language.** `?lang=en` or `Accept-Language`, else `DEFAULT_LANGUAGE`. Never hardcode user-facing text: add a key to `src/i18n/fa/errors.json` **and** `en/errors.json`, then call `t('errors.myKey', { arg })` from `common/utils/i18n.ts`. Validation messages are keyed by class-validator constraint name in `validation.json`.

## How to add a module (example: `products`)

Copy `modules/users/` as the template; it is the reference implementation.

1. `products/product.model.ts`: Mongoose schema. Use `export class ProductEntity extends Document`, and `@Prop()` for fields.
2. `products/dto/create-product.dto.ts` and `update-product.dto.ts` (`PartialType(CreateProductDto)` from `@nestjs/swagger`).
3. `products/products.repository.ts`: `extends BaseRepository<ProductEntity>`, inject the model.
4. `products/products.service.ts`: `extends BaseService<ProductEntity, CreateDto, UpdateDto>`. Pass the entity name to `super(repository, 'Product')`. Override `create`/`update` only for business rules (see `UsersService`, which hashes passwords).
5. `products/products.controller.ts`: `extends BaseController<...>(ProductEntity, CreateDto, UpdateDto, 'Product')`, plus `@Controller('products')`, `@ApiTags`, and `@Roles(...)` if needed.
6. `products/products.module.ts`: `MongooseModule.forFeature([{ name: ProductEntity.name, schema }])`, then list the controller and providers.
7. Import the module in `app.module.ts`.
8. Add `test/products/products.e2e-spec.ts` (copy `test/users/users.e2e-spec.ts`).

The generic controller gives you `POST /`, `GET /` (`?limit&offset&projection`), `GET /:id`, `PATCH /:id`, `DELETE /:id` with Swagger docs. Add custom routes as normal Nest methods on the subclass.

## Frontend layout (`frontend/src`)

`lib/api.ts` (the only fetch wrapper: adds the bearer token, unwraps `data`, redirects to `/login` on 401), `composables/useAuth.ts`, `router.ts` (guards on token), `views/` (Login, DashboardLayout, Dashboard, Users, Settings), `components/ui/` (shadcn-vue: add more with `bunx shadcn-vue add <name>`). UI text is Persian and RTL. See [frontend/docs/adr/0001-frontend-stack.md](./frontend/docs/adr/0001-frontend-stack.md).

To add a page: create `views/XView.vue`, add a route in `router.ts` and a nav entry in `DashboardLayout.vue`.

## Known shortcuts (fix before production)

- `POST /auth/sign-up` is public and creates `USER` accounts. Remove `@Public()` or add verification if sign-up must be closed.
- Token is stored in `localStorage` (XSS-readable). Move to an httpOnly cookie for production.
- `seed-admin.ts` creates a known admin password. Development only.
- `cors: true` allows all origins. Restrict it.
- Pre-existing lint errors remain in `auth.module.ts` (`StringValue`), `logger.service.ts` and `numeric-string.validator.ts`.

## Starting a new project from this

Copy the folder, `git init`, then rename the `name` fields in the three `package.json` files and the PM2 app names in `ecosystem.config.js`, and change `MONGO_URL`.

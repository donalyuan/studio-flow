# StudioFlow

Fitness Studio Membership & Class Booking Platform for a single fitness studio.
The planned application covers memberships, class bookings, and administration.
All payments are simulated. No real money is charged and no card details are collected.

## Current Delivery

This repository currently contains the application foundation and Docker environment,
based on the official Laravel React Starter Kit. Business pages, authentication flows,
and booking/payment functionality will be delivered in subsequent steps.
Frontend page implementation requires an approved prototype.

The local entry point is http://localhost:8080. At this stage it returns application
initialization metadata as JSON; it is not the public studio website.

## Stack

- Laravel 13, PHP 8.4, and Composer.
- React 19, Inertia, TypeScript, Tailwind CSS, Vite, and shadcn/ui configuration.
- MySQL 8.4 LTS, PHP-FPM, and Nginx.
- Docker Engine and Docker Compose v2 are the only required host runtimes.

## Initialize with Docker

Run all commands from the repository root. Copy the example only when `.env`
does not already exist:

```bash
cp -n .env.example .env
```

Set `DB_PASSWORD` and `DB_ROOT_PASSWORD` to your own local values. Set
`APP_TIMEZONE` to the studio's IANA time zone; `UTC` is only the initial example.
Keep `DB_HOST=db`, `DB_PORT=3306`, and `APP_DEBUG=false`. If port 8080 is occupied,
change both `APP_PORT` and the port in `APP_URL`.

```bash
docker compose build
docker compose up -d --wait
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
docker compose exec app php artisan migrate:status
curl -fsS http://localhost:8080/
curl -fsS http://localhost:8080/up
```

The application reads the mounted `.env` file directly. `key:generate` persists
the application key in that local file. Generate the key once during initial
setup; replacing an existing key invalidates encrypted data and sessions.
The current seeder intentionally creates no business data or login accounts.

On Linux, restrict the local file to its owner and the PHP-FPM group:

```bash
docker compose exec app chown root:www-data .env
docker compose exec app chmod 640 .env
```

`web` binds to localhost only. MySQL is published at `127.0.0.1:3306` for local
database clients such as Navicat. PHP-FPM has no published host port.
Node.js installs dependencies and builds assets in a Docker build stage; only
`app`, `web`, and `db` run after initialization. Both application images contain
the same compiled static assets.

For Navicat, use host `127.0.0.1`, port `3306`, database `studioflow` (or your
`DB_DATABASE` value), and the credentials from `DB_USERNAME` and `DB_PASSWORD`
in your local `.env`. Laravel continues to connect to `db:3306` inside Docker;
do not change its `DB_HOST` to `127.0.0.1`. The database port binds only to the
host loopback address and is not published on public or LAN interfaces.

## Daily Commands

```bash
docker compose up -d --wait
docker compose ps
docker compose logs --tail=100 app web db
docker compose exec app php artisan about
docker compose down
```

Source code and dependencies are copied into the images. Rebuild after source,
dependency, or frontend changes:

```bash
docker compose up -d --build --wait
```

The `db-data` named volume preserves MySQL data, and `app-storage` preserves
Laravel storage. `docker compose down` preserves both volumes. Avoid
`docker compose down -v` unless permanently deleting all local data is intended.
Once the business seeders are implemented, an explicit database reset uses
`docker compose exec app php artisan migrate:fresh --seed --force`; this deletes
existing records and should only run on a disposable local database.

## Code Quality

```bash
docker compose exec app composer validate --strict
docker compose exec app composer lint:check
docker build --target assets -t studioflow-assets:local .
```

The assets stage runs TypeScript, ESLint, Prettier, and Vite. No PHPUnit,
Laravel automated testing workflow, or GitHub Actions checks are configured.
Later business stages will be verified against the documented manual checklist.

## Foundation Source

Framework defaults and frontend tooling originate from
[Laravel's official React Starter Kit](https://github.com/laravel/react-starter-kit/tree/81cfb35e9a5bc4640556639a00459944120a261b),
at commit `81cfb35e9a5bc4640556639a00459944120a261b` (Laravel 13, React 19,
Inertia 2, Vite 8, ESLint, and Prettier). Dependency resolutions are recorded in
`composer.lock` and `package-lock.json`. Page templates and features outside
StudioFlow's requirements are not imported. shadcn/ui aliases are initialized;
UI primitives and pages will be added with the approved frontend prototype.

## Delivery Boundary

Only framework tables and migrations are initialized in this step. Membership,
class, booking, and payment tables and sample data follow their implementation stages.
There are no demo login accounts yet.

The first version is single-studio and single-currency, with no real transactions,
automatic renewals, refunds, Redis, queue workers, or persistent Node.js service.

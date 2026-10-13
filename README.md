# StudioFlow

Fitness Studio Membership & Class Booking Platform for a single fitness studio.
The planned application covers memberships, class bookings, and administration.
All payments are simulated. No real money is charged and no card details are collected.

## Current Delivery

Steps 1.1–1.3 add member registration, session login, logout, account settings,
password recovery, and administrator
role isolation. Each account has one role: `member` or `admin`. The shared
`/login` page checks the role stored on the authenticated account; it has no
identity selector. Ordinary registration always creates a member account and
ignores submitted roles. Registration requires a name, unique email address, password, and
password confirmation. Passwords use Laravel's secure hashing. Authentication
uses Fortify, same-site sessions, CSRF protection, and submission rate limits.

Passwords require at least eight characters and must fit within bcrypt's
72-byte limit; null characters are rejected. Multibyte characters may occupy
more than one byte. Email addresses are normalized to lowercase consistently.

The local entry point is http://localhost:8080. Registration and login normally
return to a minimal home page showing the member's name and logout action;
an intercepted login returns to the intended protected page. The approved
authentication design uses English text, light backgrounds, a deep-green accent,
shadcn/ui controls, and a responsive full-width header and footer.

Administrators see an `Open administration` action on home and can enter `/admin`.
All routes in `routes/web-admin.php` use authentication and administrator
middleware. Guests are redirected to login; signed-in members receive HTTP 403
with an access-restricted page. A login intercepted by `/admin` returns there
and still checks the account's role. Direct login continues to return home.
The approved step 1.2 design adds a minimal responsive administration shell and
403 page, using the same shadcn/ui controls and visual language. It contains no
business statistics or management tools yet.

Account settings at `/settings/profile` and `/settings/password` let members and
administrators update their own name, email, and password. Email addresses stay
unique and normalized to lowercase. Password updates verify the current password
and use the same limits as registration. The account remains signed in after an
update; account role cannot be changed. Changing an email or password invalidates
previous password reset links for that account.

`Forgot password?` on login opens `/forgot-password`. Laravel's password broker
sends a reset link, valid for 60 minutes. The same email must wait at least 60
seconds before another link is sent. Recovery and reset submissions each have a
separate five-per-minute limit by IP; profile and password updates each allow five
submissions per minute per account and IP. Unknown email, validation, throttling,
invalid links, and request failures show actionable errors. A successful reset
returns to login; the user signs in with the new password. No reset URL is shown
on the website.

The approved step 1.3 design keeps the existing full-width header/footer, fonts,
and deep-green accent. Account settings uses Profile/Password navigation with
side-by-side desktop layout and stacked mobile forms; recovery uses the existing
authentication layout. All standard controls use shadcn/ui. The full studio
website and member dashboard follow their documented implementation stages.
Future public navigation labels are not active links yet. Step 2.1 now adds administrator membership plan management; the detailed scope and verification checklist are below.

## Step 2.1 Membership Plan Management

Administrators manage membership plans at `/admin/membership-plans` after signing in. The page supports creating and editing monthly plans and class packs, explicitly choosing availability, enabling or disabling an existing record, and deleting a plan that has never been purchased. Deletion requires confirmation and sets `deleted_at`; the record remains in the database but is hidden from the default catalog. There is no restore action. A successfully paid order prevents deletion, including direct requests to the backend; pending, cancelled and expired orders do not. Prices are stored as exact USD decimal amounts. Monthly plans show unlimited classes and persist `total_classes` as `NULL`; class packs require a positive total class count. Plan names, descriptions, prices, validity days, class counts, and enabled state are validated by the backend, including the `DECIMAL(10,2)` and unsigned-integer limits.

The approved prototype is recorded locally in `.local/ai/step-2.1-prototype/DESIGN.md`; production implementation uses the same responsive administration shell, desktop table/detail layout, mobile cards, and empty, validation, success, submitting, request-failure and deletion-confirmation states. Standard controls use shadcn/ui primitives and the `frontend-design` process. The order table and model provide the paid-order relationship for deletion checks and retain historical plan references and snapshots. Purchase eligibility, checkout, payment, card issuance and public membership browsing remain deferred to their documented stages. Future payment success and plan deletion must use the same plan row lock; historical pending orders keep their snapshot even if the plan is soft deleted.

To verify this step, sign in as an administrator, open `Membership plans`, create one monthly plan and one class pack, edit a class pack to monthly and confirm the allowance becomes unlimited, toggle availability twice, and confirm the success messages and disabled-plan catalog row. Cancel a deletion confirmation and verify that the plan remains; then delete an unpurchased plan and verify that it disappears while its database record has `deleted_at` set. A plan with a paid-order fixture must show the deletion restriction and reject a direct DELETE request. Pending, cancelled and expired order fixtures must retain their snapshot and plan reference after soft deletion. Submit empty or malformed values to check field errors and retained input. Repeat at 390px and 320px widths; the mobile layout uses cards and a collapsed administration navigation. A member or guest must receive the existing access restriction or login redirect for all five plan routes.

The seeder is idempotent for a catalog containing any record, including soft-deleted records, so rerunning it does not recreate deleted demo plans. Existing local verification rows are data, not application fixtures; do not reset the database with `migrate:fresh` on a shared local volume.

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
The membership plan seeder creates the two approved USD demo plans only when the membership table has no records, including soft-deleted records; it never overwrites edited plans or recreates deleted ones. It does not create login accounts or orders.

After migrations, create a separate administrator through the interactive
initialization command:

```bash
docker compose exec app php artisan studioflow:create-admin
```

Enter a name, an unused email address, and a password with confirmation. Password
entry is hidden and uses the same limits as registration. The command rejects
existing emails, so it cannot promote or overwrite a member account. Register a
different email at `/register` to exercise the member role. Both accounts log in
at `/login`. Administrator creation is a local initialization command, not a web
action; no default password or automatic administrator registration is provided.

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
The approved authentication pages compose shadcn/ui primitives.

The authentication prototype uses a studio photograph from
[Unsplash](https://images.unsplash.com/photo-1534438327276-14e5300c3a48), stored
locally in `public/assets/studio.jpg`. Barlow Semi Condensed and DM Sans are
loaded through Google Fonts, with a system sans-serif fallback.

## Delivery Boundary

Framework tables, user roles, membership plans with soft deletion, and the order
data foundation are initialized at this stage. Class, booking, payment-attempt
and membership-card tables follow their implementation stages. Order creation
and payment flows are not implemented yet. A new environment has no demo login accounts until an
administrator is created with `studioflow:create-admin` and a member registers.

## Verify Registration and Login

Visit `/register` and create a member with a unique email and matching passwords
of at least eight characters. Confirm that the home page shows the member's
name. Log out, then try registering the same email again; the email field must
show an error. Try logging in with an incorrect password, then the correct
password. Confirm that logout returns to an empty login form and that the home
page no longer shows the member's name. Check the login and registration pages
at desktop and mobile widths. Submitting a form disables repeat submission.

Authentication checks can create local accounts. Use dedicated verification
addresses rather than real personal data. No default administrator credentials
are provided.

## Verify Role Isolation

Create an administrator with `studioflow:create-admin` and a separate member
through `/register`. Log in as the administrator and confirm that home offers
`Open administration`, `/admin` loads, the mobile menu works, and logout returns
to login. Log in as the member and confirm that home has no administration
action; directly visiting `/admin` must return HTTP 403 with `Return home`.

Log out, then visit `/admin`. Confirm the redirect to `/login`. Administrator
login must return to `/admin`; member login must return to `/admin` with HTTP 403.
Ordinary direct login must still return home. Submitting `role=admin` to member
registration must not create an administrator. All future administrator pages
and operations must remain inside the same authenticated administrator route
group. Member-only workflows are added with their respective business stages.

## Verify Account Settings and Password Recovery

Log in with a dedicated test member. Open `Account settings` from home or the
header (the mobile menu provides the same entry). Save a new name and an unused
email address; confirm the saved values after reloading and the updated name in
the header. Attempt to use another account's email and confirm a field error.
Submitting an account id or role must not update anyone else or change the role.
An administrator uses the same settings pages and can return to administration.
Guests visiting either settings page must log in and then return to that page.

Open Password. Try a wrong current password, a short password, and mismatched
confirmation; each must fail without changing the password. Update it with the
correct current password and matching valid new values. Confirm success, cleared
password fields, and an active session. Log out: the old password must fail and
the new one must log in. Check the eight-character minimum and 72-byte maximum
with multibyte text if demonstrating password boundaries.

For the local demonstration, keep `MAIL_MAILER=log` in `.env`. Log out, open
`Forgot password?`, and submit the test account's current email. The success
message means a notification was written to the local application log; this
transport does not deliver to a real inbox. Read it privately:

```bash
docker compose exec app tail -n 100 storage/logs/mail-preview.log
```

Open only your own test account's reset URL from that log. Confirm the email is
prefilled and the password fields are blank. Set and confirm a valid new
password; confirm the redirect to login, success feedback, old-password rejection,
and new-password login. Opening the used link again must show an invalid-link
message with `Request a new reset link`. A link older than 60 minutes must behave
the same way. Invalid email, an unknown email, and another link request within
60 seconds must show errors; they must not report a successful send. Requests
that fail to send mail must preserve the error and allow a retry.

Password reset logs contain private links. Do not publish them, expose a log
viewer, or use other people's accounts during a demonstration. Public demos use
dedicated preset accounts; SMTP delivery can be configured separately when needed.
No payment provider, queue worker, or external mail account is required locally.
The log mail transport uses a separate `mail-preview` channel so application log
filtering does not discard the reset notification.

Check these pages at desktop and mobile sizes. While submitting, fields and the
action button must be disabled. A failed request must show a retry message;
profile and recovery email inputs remain available for retry, while password
inputs are cleared after a completed attempt. A session-expired response prompts
a refresh. The website contains no prototype review controls.

The first version is single-studio and single-currency, with no real transactions,
automatic renewals, refunds, Redis, queue workers, or persistent Node.js service.

# syntax=docker/dockerfile:1

FROM php:8.4-fpm-bookworm AS tooling

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git unzip libicu-dev libonig-dev libzip-dev \
    && docker-php-ext-install -j"$(nproc)" bcmath intl mbstring opcache pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/php/app.ini /usr/local/etc/php/conf.d/zz-studioflow.ini

WORKDIR /var/www/html

FROM tooling AS dependencies

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts --no-autoloader

FROM node:24-bookworm-slim AS assets

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.ts tsconfig.json eslint.config.js .prettierrc .prettierignore ./
RUN npm run types:check && npm run lint:check && npm run format:check && npm run build

FROM tooling AS app

COPY --chown=www-data:www-data . .
COPY --from=dependencies --chown=www-data:www-data /var/www/html/vendor ./vendor
COPY --from=assets --chown=www-data:www-data /build/public/build ./public/build
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && composer dump-autoload --optimize --no-interaction \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]

FROM nginx:1.28-alpine AS web

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/html/public /var/www/html/public

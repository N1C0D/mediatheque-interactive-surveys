# ===========================================
# Backend Dockerfile - Symfony API Platform
# ===========================================

# Base stage with PHP and extensions
FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    acl \
    fcgi \
    file \
    gettext \
    git \
    gnu-libiconv \
    postgresql-dev \
    icu-dev \
    libzip-dev \
    linux-headers

# Install PHP extensions
RUN docker-php-ext-install \
    intl \
    opcache \
    pdo_pgsql \
    zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Development stage
FROM base AS development

# Install Xdebug for development
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug

# PHP development configuration
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# Xdebug configuration
RUN echo "xdebug.mode=develop,debug" >> "$PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini" \
    && echo "xdebug.client_host=host.docker.internal" >> "$PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini" \
    && echo "xdebug.start_with_request=trigger" >> "$PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini"

# Install Symfony CLI
RUN curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.alpine.sh' | sh \
    && apk add symfony-cli

# Install Caddy for serving PHP (alternative to nginx/apache)
RUN apk add --no-cache caddy

# Copy Caddyfile for PHP-FPM
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY . .

# Install dependencies
RUN composer install --prefer-dist --no-progress --no-interaction

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sh", "-c", "php-fpm -D && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]

# Production stage
FROM base AS production

# PHP production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# OPcache configuration for production
RUN echo "opcache.memory_consumption=256" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "opcache.max_accelerated_files=20000" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "opcache.validate_timestamps=0" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "realpath_cache_size=4096K" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "realpath_cache_ttl=600" >> "$PHP_INI_DIR/conf.d/opcache.ini"

# Install Caddy
RUN apk add --no-cache caddy

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY . .

# Install only production dependencies
RUN composer install --prefer-dist --no-dev --no-progress --no-interaction --optimize-autoloader

# Warm up cache
RUN php bin/console cache:warmup --env=prod

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sh", "-c", "php-fpm -D && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]

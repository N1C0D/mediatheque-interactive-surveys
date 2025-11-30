#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until php bin/console dbal:run-sql "SELECT 1" > /dev/null 2>&1; do
    echo "Database not ready, retrying..."
    sleep 2
done
echo "Database is ready!"

# Run migrations
echo "Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Load fixtures in dev environment
if [ "$APP_ENV" = "dev" ]; then
    echo "Loading fixtures..."
    php bin/console doctrine:fixtures:load --no-interaction
fi

# Clear and warm up cache
echo "Warming up cache..."
php bin/console cache:clear

# Start PHP-FPM and Caddy
echo "Starting services..."
exec "$@"

#!/bin/sh

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  echo "Database not ready yet, waiting..."
  sleep 1
done

echo "Database is ready!"

echo "Running migrations..."
python3 manage.py migrate

echo "Starting application..."
exec "$@"
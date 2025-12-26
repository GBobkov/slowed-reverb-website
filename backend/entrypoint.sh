#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:10000

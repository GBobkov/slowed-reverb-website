FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache \
    musl-dev \
    postgresql-dev \
    ffmpeg \
    libffi-dev \
    openssl-dev \
    netcat-openbsd

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/media

ARG FRONTEND_URL=http://localhost:3000
ENV FRONTEND_URL=$FRONTEND_URL

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser:appgroup

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]

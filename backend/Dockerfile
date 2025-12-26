FROM python:3.12

RUN python -m pip install --upgrade pip

RUN apt-get update && \
    apt-get install -y ffmpeg build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]

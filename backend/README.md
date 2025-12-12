# Backend - Audio Editor Project

Это backend для проекта аудио-редактора, написанный на Django. Он обеспечивает загрузку, обработку и отдачу аудиофайлов через REST API.

---

## Структура проекта

```
backend/
├── api/                 # Основные API для работы с пользователями и аутентификацией
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── ...
├── tracks/              # Обработка аудио и управление треками
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── ...
├── backend/             # Настройки Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── media/               # Хранилище загруженных и обработанных аудио
├── db.sqlite3           # SQLite база данных
└── manage.py            # Основной скрипт управления Django
```

---

## Локальный запуск

1. **Создайте виртуальное окружение:**

```bash
python -m venv venv
source venv/bin/activate  # Linux / MacOS
venv\Scripts\activate     # Windows
```

2. **Установите зависимости:**

```bash
pip install -r requirements.txt
```

3. **Примените миграции:**

```bash
python manage.py migrate
```

4. **Запустите сервер:**

```bash
python manage.py runserver
```

По умолчанию сервер будет доступен по адресу `http://127.0.0.1:8000/`.

---

##  Настройка

* `backend/settings.py` — основной файл настроек.
* `MEDIA_ROOT` и `MEDIA_URL` — директория и URL для загруженных аудио.
* `DATABASES` — используется SQLite (db.sqlite3), перенос данных не требуется.

---

##  API

* `POST /api/tracks/process/` — загрузка и обработка аудиофайла.
* `GET /api/tracks/<id>/download/` — скачивание обработанного трека.
* Другие эндпоинты находятся в `api/urls.py`.

---

##  Зависимости

* Django
* djangorestframework
* Другие зависимости указаны в `requirements.txt`

---


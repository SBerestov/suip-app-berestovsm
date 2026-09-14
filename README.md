# SUIP - Система учета и планирования

## О проекте
Система инвентаризации материалов для оптимизации учета на складе. Выполнена в качестве учебной дисциплины в ПНИПУ Технологии разработки программных продуктов, преподаватель Кравец В.А.
Реализовано:
- Управление материалами: добавление, редактирование, удаление.
- Поиск по названию, категориям, количеству.
- Заведение новых материалов в интерактивном формате.

## Технологии
**Бэкенд**:
- Python 3.10+
- Flask 3.1.0
- PostgreSQL

## Запуск локально
1. **Установить PostgreSQL**
https://www.postgresql.org/download/

Дополнительно еще можно скачать GUI https://www.postgresql.org/ftp/pgadmin/pgadmin4/v9.17/

После этого создайте сервер и БД

2. **Клонировать репозиторий**:
   ```bash
   git clone https://github.com/SBerestov/suip-app-berestovsm.git
   cd suip-app-berestovsm

3. **Настроить config**
В корне проекта, в файле config.example.py введите данные созданной БД: name, user, password, port и переименуйте файл с config.example.py -> config.py

4. **Забилдить фронт**
   ```bash
   Открыть другой терминал

   cd .\frontend\
   npm install
   npm run build

5. **Настроить виртуальное окружение**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate    # Windows

6. Установить зависимости
   ```bash
   pip install -r requirements.txt

7. Запустить приложение
   ```bash
   python run.app

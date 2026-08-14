from flask import Blueprint, render_template, request, jsonify, current_app, url_for, send_from_directory
from backend.database import get_db_cursor
import logging
from psycopg2 import sql, DatabaseError
import os
from werkzeug.utils import secure_filename
from PIL import Image

# Настройки для загрузки изображения
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
UPLOAD_FOLDER = 'static/uploads/materials'

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

api_bp = Blueprint('api', __name__)

# Настройка логгера
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_bp.route('/<table_name>')
def get_table(table_name):
    allowed_tables = ['os', 'works', 'materials', 'equipment']
    if table_name not in allowed_tables:
        logger.warning(f"попытка доступа к несуществующей таблице: {table_name}")
        return "Invalid table", 400
    
    search_query = request.args.get('search', '')
    logger.info(f"Запрос к таблицу {table_name}, поиск: '{search_query}'")
    
    
    with get_db_cursor() as cursor:
        # Получаем список всех колонок таблицы
        cursor.execute(sql.SQL("SELECT * FROM {} LIMIT 0").format(sql.Identifier(table_name)))
        columns = [desc[0] for desc in cursor.description]
        
        base_query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(table_name))
        params = []
        
        # Условия поиска
        if search_query:
            search_conditions = [
                sql.SQL("CAST({} AS TEXT) ILIKE %s").format(sql.Identifier(col)) for col in columns
            ]
            logger.info(f"search_conditions: {search_conditions}")
            base_query = base_query + sql.SQL(" WHERE {}").format(
                sql.SQL('OR ').join(search_conditions)
            )
            
            params = ['%' + search_query + '%'] * len(columns)
            logger.info(f"params: {params}")
        else:
            base_query = base_query + sql.SQL(" ORDER BY \"ID\" ASC")
        
        cursor.execute(base_query, params)
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        logger.info(f"base_query: {base_query}, params: '{params}'")
        
    
    return jsonify({ 
        "active_table": table_name, 
        "data": data, 
        "search_query": search_query,
        "columns": columns
    })
    
@api_bp.route('/add-form-fields')
def get_add_form_fields():
    table_name = request.args.get('table')
    allowed_tables = ['os', 'works', 'materials', 'equipment']
    
    if table_name not in allowed_tables:
        return "Invalid table", 400
    
    column_translations = {
        'os': {
            'REGION': 'Регион',
            'PLATFORM_ADDRESS': 'Адрес площадки',
            'EQUIPMENT_MODEL': 'Модель оборудования',
            'INVENTORY_NUMBER': 'Инвентарный номер',
            'STATUS': 'Статус',
            'EXPLOITATION_DATE': 'Дата добавления'
        },
        'works': {
            'DESCRIPTION': 'Описание работ',
            'OS': 'ОС',
            'PLANNED_DATE': 'Запланированная дата',
            'STATUS': 'Статус'
        },
        'materials': {
            'TYPE': 'Тип комплектующего',
            'NAME': 'Название модели',
            'PART_NUMBER': 'Артикул производителя',
            'SERIAL_NUMBER': 'Серийный номер',
            'STORE_ADDRESS': 'Адрес склада',
            'RECEIVE_DATE': 'Дата получения',
            'ROW': 'Ряд',
            'SHELF': 'Полка',
            'CONTAINER': 'Контейнер',
            'COMMENT': 'Комментарий'
        },
        'equipment': {
            'MODEL': 'Модель оборудования',
            'MODEL_SERIES': 'Модель серии'
        }
    }
    
    # Получаем колонки таблицы
    with get_db_cursor() as cursor:
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 0")
        columns = [desc[0] for desc in cursor.description]
    
    # Фильтруем колонки, которые разрешены для отображения
    allowed_columns = {
        'os': ['REGION', 'PLATFORM_ADDRESS', 'EQUIPMENT_MODEL', 'INVENTORY_NUMBER', 'STATUS', 'EXPLOITATION_DATE'],
        'works': ['DESCRIPTION', 'OS', 'PLANNED_DATE', 'STATUS'],
        'materials': ['TYPE', 'NAME', 'PART_NUMBER', 'SERIAL_NUMBER', 'STORE_ADDRESS', 'RECEIVE_DATE', 'ROW', 'SHELF', 'CONTAINER', 'COMMENT'],
        'equipment': ['MODEL', 'MODEL_SERIES']
    }
    
    # Выбираем нужные колонки
    selected_columns = [col for col in columns if col in allowed_columns[table_name]]
    
    # Создаем список переводов
    translations = column_translations.get(table_name, {})
    selected_columns_translated = [translations.get(col, col) for col in selected_columns]
    
    return jsonify({
        "columns": selected_columns, 
        "columns_translated": selected_columns_translated
    })

@api_bp.route('/add/<table_name>', methods=['POST'])
def add_entry(table_name):
    allowed_tables = ['os', 'works', 'materials', 'equipment']
    if table_name not in allowed_tables:
        return jsonify({"error": "Invalid table"}), 400
    
    try:
        # Получаем json объект из форм
        form_data = request.get_json()
        if not form_data:
            return jsonify({"error": "No data provided"}), 400
        
        # Получаем колонки таблицы
        with get_db_cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 0")
            columns = [desc[0].upper() for desc in cursor.description]
        
        # Проверка данных из json
        valid_data = {key.upper(): item for key, item in form_data.items() if key.upper() in columns}
        
        # Формируем SQL-запрос
        query = sql.SQL("""
            INSERT INTO {} ({})
            VALUES ({})
        """).format(
            sql.Identifier(table_name),
            sql.SQL(', ').join(map(sql.Identifier, valid_data.keys())),
            sql.SQL(', ').join([sql.Placeholder()] * len(valid_data))
        )
        
        # Выполняем запрос
        with get_db_cursor() as cursor:
            cursor.execute(query, list(valid_data.values()))
        
        return jsonify({"success": True}), 200

    except DatabaseError as e:
        logger.error(f"Database error: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@api_bp.route('/<table_name>/<int:entry_id>')
def get_entry(table_name, entry_id):
    allowed_tables = ['os', 'works', 'materials', 'equipment']
    if table_name not in allowed_tables:
        return jsonify({"error": "Invalid table"}), 400
    
    with get_db_cursor() as cursor:
        query = sql.SQL("SELECT * FROM {} WHERE \"ID\" = %s").format(sql.Identifier(table_name))
        cursor.execute(query, (entry_id,))
        entry = cursor.fetchone()
        if not entry:
            return jsonify({"error": "Entry not found"}), 404
        
        columns = [desc[0] for desc in cursor.description]
        data = dict(zip(columns, entry))
        
    return jsonify(data)
    
@api_bp.route('/delete/<table_name>/<int:entry_id>', methods=['DELETE'])
def delete_entry(table_name, entry_id):
    allowed_tables = ['os', 'works', 'materials', 'equipment']
    if table_name not in allowed_tables:
        return jsonify({"error": "Invalid table"}), 400
    
    with get_db_cursor() as cursor:
        query = sql.SQL("DELETE FROM {} WHERE \"ID\" = %s").format(sql.Identifier(table_name))
        cursor.execute(query, (entry_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Cannot delete entry"}), 404
        
    return jsonify({"success": True}), 200

@api_bp.route('/update/<table_name>/<int:entry_id>', methods=['PUT'])
def update_entry(table_name, entry_id):
    try:
        # Обработка обычных полей формы
        if request.content_type and 'application/json' in request.content_type:
            form_data = request.get_json()
        else:
            form_data = request.values.to_dict()
        
        # Обработка изображения
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                # Сохраняем изображение
                upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
                os.makedirs(upload_path, exist_ok=True)
                
                filename = secure_filename(f"{table_name}_{entry_id}_{file.filename}")
                filepath = os.path.join(upload_path, filename)
                
                img = Image.open(file.stream)
                if img.width > 400:
                    ratio = 400 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((400, new_height), Image.LANCZOS)
                
                base, ext = os.path.splitext(filename)
                if ext.lower() != '.webp':
                    filename = base + '.webp'
                    filepath = os.path.join(upload_path, filename)
                
                img.save(filepath, 'WEBP', quality=85)
                form_data['IMAGE_PATH'] = os.path.join('uploads', 'materials', filename)
        
        # Обновление записи в БД
        with get_db_cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 0")
            columns = [desc[0] for desc in cursor.description]
            
            valid_data = {}
            for key, value in form_data.items():
                if key in columns:
                    valid_data[key] = value
            
            if not valid_data:
                return jsonify({"error": "No valid fields to update"}), 400
                
            # Формируем SQL запрос
            set_clause = ', '.join([f'"{k}" = %s' for k in valid_data.keys()])
            values = list(valid_data.values())
            values.append(entry_id)
            
            query = f'UPDATE {table_name} SET {set_clause} WHERE \"ID\" = %s'
            cursor.execute(query, values)
            
        return jsonify({
            "success": True,
            "image_url": url_for('static', filename=form_data.get('IMAGE_PATH', ''))
        })
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@api_bp.route('/upload_image/<table_name>/<int:entry_id>', methods=['POST'])
def upload_image(table_name, entry_id):
    if table_name not in ['os', 'works', 'materials', 'equipment']:
        return jsonify({"error": "Invalid table"}), 400
    
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Создаем папку для загрузок
            upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
            os.makedirs(upload_path, exist_ok=True)
            
            # Обработка имени файла
            filename = secure_filename(f"{table_name}_{entry_id}_{file.filename}")
            filepath = os.path.join(upload_path, filename)
            
            # Открываем и обрабатываем изображение
            img = Image.open(file.stream)
            
            # Сжимаем изображение
            if img.width > 400:
                ratio = 400 / img.width
                new_height = int(img.height * ratio)
                img = img.resize((400, new_height), Image.LANCZOS)
                
            # Конвертация в формат webp
            base, ext = os.path.splitext(filename)
            if ext.lower() != '.webp':
                filename = base + '.webp'
                filepath = os.path.join(upload_path, filename)
                
            img.save(filepath, 'WEBP', quality=85)
            
            # Сохраняем путь в БД
            relative_path = os.path.join('uploads', 'materials', filename)
            with get_db_cursor() as cursor:
                query = sql.SQL("UPDATE {} SET \"IMAGE_PATH\" = %s WHERE \"ID\" = %s").format(
                    sql.Identifier(table_name)
                )
                cursor.execute(query, (relative_path, entry_id))
                
            return jsonify({
                "success": True,
                "image_url": url_for('static', filename=relative_path)
            })
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return jsonify({"error": str(e)}), 500
        
    return jsonify({"error": "Invalid file type"}), 400

@api_bp.route('/delete_image/<table_name>/<int:entry_id>', methods=['DELETE'])
def delete_image(table_name, entry_id):
    try:
        with get_db_cursor() as cursor:
            # Получаем текущий путь изображения
            cursor.execute(
                sql.SQL("SELECT \"IMAGE_PATH\" FROM {} WHERE \"ID\" = %s").format(
                    sql.Identifier(table_name)
                ),
                (entry_id,)
            )
            image_path = cursor.fetchone()[0]
            
            if image_path:
                # Удаляем файл
                full_path = os.path.join(current_app.root_path, 'static', image_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
                
                # Обновляем запись в БД
                cursor.execute(
                    sql.SQL("UPDATE {} SET \"IMAGE_PATH\" = NULL WHERE \"ID\" = %s").format(
                        sql.Identifier(table_name)
                    ),
                    (entry_id,)
                )
            
        return jsonify({"success": True})
        
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        return jsonify({"error": str(e)}), 500
    
@api_bp.route('/uploads/<path:subpath>')
def get_uploaded_image(subpath):
    uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    return send_from_directory(uploads_dir, subpath)


@api_bp.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({"success": True, "message": "Test successful"}), 200
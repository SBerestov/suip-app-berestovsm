from flask import Blueprint, render_template, request, jsonify, current_app, url_for, send_from_directory
from backend.database import get_db_cursor
import logging
from datetime import datetime
from psycopg2 import sql, DatabaseError, IntegrityError
import os
from werkzeug.utils import secure_filename
from PIL import Image, ExifTags

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


def _to_int(value):
    """Безопасно приводит значение к int (пустое/None/мусор -> 0)."""
    if value is None or value == '':
        return 0
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _apply_stock_delta(cursor, material_id, delta):
    """Изменяет остаток материала на складе. delta<0 — списание, delta>0 — возврат."""
    if not material_id or not delta:
        return
    cursor.execute(
        'UPDATE materials SET "QUANTITY" = "QUANTITY" + %s WHERE "ID" = %s',
        (delta, material_id)
    )

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
        
        # Для таблицы работ дополнительно добавляем количество связанных материалов
        is_works = table_name == 'works'
        if is_works:
            columns = [col for col in columns if col != 'MATERIALS_COUNT']
            if 'MATERIALS_COUNT' not in columns:
                columns.append('MATERIALS_COUNT')
            base_query = sql.SQL("""
                SELECT w.*, COALESCE(mc.cnt, 0)::int AS "MATERIALS_COUNT"
                FROM works w
                LEFT JOIN (
                    SELECT "WORK_ID", COUNT(*) AS cnt
                    FROM works_materials
                    GROUP BY "WORK_ID"
                ) mc ON mc."WORK_ID" = w."ID"
            """).format()
        else:
            base_query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(table_name))
        params = []
        
        # Условия поиска
        if search_query:
            search_columns = [col for col in columns if col != 'MATERIALS_COUNT']
            search_conditions = [
                sql.SQL("CAST(w.{} AS TEXT) ILIKE %s").format(sql.Identifier(col)) for col in search_columns
            ] if is_works else [
                sql.SQL("CAST({} AS TEXT) ILIKE %s").format(sql.Identifier(col)) for col in search_columns
            ]
            logger.info(f"search_conditions: {search_conditions}")
            base_query = base_query + sql.SQL(" WHERE {}").format(
                sql.SQL('OR ').join(search_conditions)
            )
            
            params = ['%' + search_query + '%'] * len(search_columns)
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
            'CMDB_STATUS': 'Статус',
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
        'os': ['REGION', 'PLATFORM_ADDRESS', 'EQUIPMENT_MODEL', 'INVENTORY_NUMBER', 'CMDB_STATUS', 'EXPLOITATION_DATE'],
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

@api_bp.route('/options/<string:kind>')
def get_options(kind):
    queries = {
        'os_models': 'SELECT DISTINCT "EQUIPMENT_MODEL" AS v FROM os WHERE "EQUIPMENT_MODEL" IS NOT NULL AND "EQUIPMENT_MODEL" <> \'\' ORDER BY v',
        'equipment_models': 'SELECT DISTINCT "MODEL" AS v FROM equipment WHERE "MODEL" IS NOT NULL AND "MODEL" <> \'\' ORDER BY v',
    }
    query = queries.get(kind)
    if not query:
        return jsonify({"error": "Unknown options kind"}), 400

    with get_db_cursor() as cursor:
        cursor.execute(query)
        data = [row[0] for row in cursor.fetchall()]

    return jsonify({"data": data})

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
            RETURNING "ID"
        """).format(
            sql.Identifier(table_name),
            sql.SQL(', ').join(map(sql.Identifier, valid_data.keys())),
            sql.SQL(', ').join([sql.Placeholder()] * len(valid_data))
        )
        
        # Выполняем запрос
        with get_db_cursor() as cursor:
            cursor.execute(query, list(valid_data.values()))
            new_id = cursor.fetchone()[0]
        
        logger.info(f"Добавлена запись в {table_name} с ID={new_id}")
        return jsonify({"success": True, "id": new_id}), 200

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

@api_bp.route('/works/<int:work_id>/materials')
def get_work_materials(work_id):
    with get_db_cursor() as cursor:
        query = sql.SQL("""
            SELECT
                wm."ID" AS "LINK_ID",
                wm."WORK_ID",
                wm."MATERIAL_ID",
                wm."PLANNED_QUANTITY",
                wm."ACTUAL_QUANTITY",
                wm."NOTE",
                m."NAME" AS "MATERIAL_NAME",
                m."TYPE" AS "MATERIAL_TYPE",
                m."PART_NUMBER",
                m."SERIAL_NUMBER",
                m."STORE_ADDRESS"
            FROM works_materials wm
            LEFT JOIN materials m ON m."ID" = wm."MATERIAL_ID"
            WHERE wm."WORK_ID" = %s
            ORDER BY m."ID"
        """)
        cursor.execute(query, (work_id,))
        columns = [desc[0] for desc in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"data": data})

@api_bp.route('/materials/<int:material_id>/works')
def get_material_works(material_id):
    with get_db_cursor() as cursor:
        query = sql.SQL("""
            SELECT
                wm."ID" AS "LINK_ID",
                wm."WORK_ID",
                wm."PLANNED_QUANTITY",
                wm."ACTUAL_QUANTITY",
                wm."NOTE",
                w."DESCRIPTION" AS "WORK_NAME",
                w."OS",
                w."STATUS",
                w."PLANNED_DATE"
            FROM works_materials wm
            JOIN works w ON w."ID" = wm."WORK_ID"
            WHERE wm."MATERIAL_ID" = %s
            ORDER BY w."ID"
        """)
        cursor.execute(query, (material_id,))
        columns = [desc[0] for desc in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"data": data})

@api_bp.route('/works/<int:work_id>/materials', methods=['POST'])
def add_work_material(work_id):
    form_data = request.get_json()
    if not form_data:
        return jsonify({"error": "No data provided"}), 400

    material_id = form_data.get('MATERIAL_ID')
    if material_id is None:
        return jsonify({"error": "MATERIAL_ID is required"}), 400

    planned = _to_int(form_data.get('PLANNED_QUANTITY'))
    actual = _to_int(form_data.get('ACTUAL_QUANTITY'))
    note = form_data.get('NOTE')

    try:
        with get_db_cursor() as cursor:
            query = sql.SQL("""
                INSERT INTO works_materials ("WORK_ID", "MATERIAL_ID", "PLANNED_QUANTITY", "ACTUAL_QUANTITY", "NOTE")
                VALUES (%s, %s, %s, %s, %s)
                RETURNING "ID"
            """)
            cursor.execute(query, (work_id, material_id, planned, actual, note))
            link_id = cursor.fetchone()[0]

            # Списываем со склада по факту
            _apply_stock_delta(cursor, material_id, -actual)
    except IntegrityError as e:
        logger.error(f"Integrity error adding work material: {e}")
        return jsonify({"error": "Этот материал уже добавлен в работу"}), 409
    except DatabaseError as e:
        logger.error(f"Database error adding work material: {e}")
        return jsonify({"error": str(e)}), 500

    logger.info(f"Добавлен материал {material_id} в работу {work_id}, link_id={link_id}, списано={actual}")
    return jsonify({"success": True, "id": link_id}), 200

@api_bp.route('/works_materials/<int:link_id>', methods=['PUT'])
def update_work_material(link_id):
    form_data = request.get_json()
    if not form_data:
        return jsonify({"error": "No data provided"}), 400

    valid_fields = {}
    for key in ['PLANNED_QUANTITY', 'ACTUAL_QUANTITY', 'NOTE']:
        if key in form_data:
            valid_fields[key] = form_data[key]

    if not valid_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                'SELECT "MATERIAL_ID", "ACTUAL_QUANTITY" FROM works_materials WHERE "ID" = %s',
                (link_id,)
            )
            existing = cursor.fetchone()
            if not existing:
                return jsonify({"error": "Link not found"}), 404

            material_id, old_actual = existing
            old_actual = old_actual or 0

            update_values = {}
            for k, v in valid_fields.items():
                update_values[k] = _to_int(v) if k in ('PLANNED_QUANTITY', 'ACTUAL_QUANTITY') else v

            new_actual = update_values.get('ACTUAL_QUANTITY', old_actual)

            set_clause = ', '.join([f'"{k}" = %s' for k in update_values.keys()])
            values = list(update_values.values())
            values.append(link_id)
            cursor.execute(f'UPDATE works_materials SET {set_clause} WHERE "ID" = %s', values)

            # Корректируем склад на разницу фактов
            _apply_stock_delta(cursor, material_id, old_actual - new_actual)
    except DatabaseError as e:
        logger.error(f"Database error updating work material: {e}")
        return jsonify({"error": str(e)}), 500

    return jsonify({"success": True}), 200

@api_bp.route('/works_materials/<int:link_id>', methods=['DELETE'])
def delete_work_material(link_id):
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                'SELECT "MATERIAL_ID", "ACTUAL_QUANTITY" FROM works_materials WHERE "ID" = %s',
                (link_id,)
            )
            existing = cursor.fetchone()
            if not existing:
                return jsonify({"error": "Link not found"}), 404

            material_id, actual = existing
            actual = actual or 0

            cursor.execute('DELETE FROM works_materials WHERE "ID" = %s', (link_id,))

            # Возвращаем на склад
            _apply_stock_delta(cursor, material_id, actual)
    except DatabaseError as e:
        logger.error(f"Database error deleting work material: {e}")
        return jsonify({"error": str(e)}), 500

    return jsonify({"success": True}), 200

@api_bp.route('/delete/<table_name>/<int:entry_id>', methods=['DELETE'])
def delete_entry(table_name, entry_id):
    allowed_tables = ['os', 'works', 'materials', 'equipment']
    if table_name not in allowed_tables:
        return jsonify({"error": "Invalid table"}), 400
    
    try:
        with get_db_cursor() as cursor:
            # При удалении работы возвращаем на склад материалы всех её связей,
            # т.к. они будут удалены каскадом на уровне БД.
            if table_name == 'works':
                cursor.execute(
                    'SELECT "MATERIAL_ID", "ACTUAL_QUANTITY" FROM works_materials WHERE "WORK_ID" = %s',
                    (entry_id,)
                )
                for material_id, actual in cursor.fetchall():
                    _apply_stock_delta(cursor, material_id, actual or 0)

            query = sql.SQL("DELETE FROM {} WHERE \"ID\" = %s").format(sql.Identifier(table_name))
            cursor.execute(query, (entry_id,))
            if cursor.rowcount == 0:
                return jsonify({"error": "Cannot delete entry"}), 404
    except IntegrityError as e:
        logger.error(f"Integrity error deleting {table_name}/{entry_id}: {e}")
        return jsonify({"error": "Нельзя удалить: запись используется в работах"}), 409
    except DatabaseError as e:
        logger.error(f"Database error deleting {table_name}/{entry_id}: {e}")
        return jsonify({"error": str(e)}), 500
        
    return jsonify({"success": True}), 200

def fix_image_orientation(img):
    try:
        # Проверяем наличие EXIF данных
        if hasattr(img, '_getexif'):
            exif = img._getexif()
            if exif is not None:
                # Ищем тег ориентации в EXIF
                for tag, value in ExifTags.TAGS.items():
                    if value == 'Orientation':
                        orientation_tag = tag
                        break
                else:
                    orientation_tag = None
                
                # Получаем значение ориентации
                if orientation_tag and orientation_tag in exif:
                    orientation = exif[orientation_tag]
                    
                    # Применяем соответствующий поворот
                    if orientation == 3:
                        img = img.rotate(180, expand=True)
                    elif orientation == 6:
                        img = img.rotate(270, expand=True)
                    elif orientation == 8:
                        img = img.rotate(90, expand=True)
    except Exception as e:
        logger.warning(f"Could not fix image orientation: {e}")
    
    return img

@api_bp.route('/update/<table_name>/<int:entry_id>', methods=['PUT'])
def update_entry(table_name, entry_id):
    UPLOAD_FOLDER = f'static/uploads/{table_name}'

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
                
                img = fix_image_orientation(img)
                
                if img.width > 1200:
                    ratio = 1200 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((1200, new_height), Image.LANCZOS)
                
                base, ext = os.path.splitext(filename)
                if ext.lower() != '.webp':
                    filename = base + '.webp'
                    filepath = os.path.join(upload_path, filename)
                
                img.save(filepath, 'WEBP', quality=85)
                form_data['IMAGE_PATH'] = os.path.join('uploads', table_name, filename)
        
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
    
@api_bp.route('/upload_images/<table_name>/<int:entry_id>', methods=['POST'])
def upload_images(table_name, entry_id):
    UPLOAD_FOLDER = f'static/uploads/{table_name}'
    
    if table_name not in ['os', 'works', 'materials', 'equipment']:
        return jsonify({"error": "Invalid table"}), 400
    
    if 'images' not in request.files:
        return jsonify({"error": "No files part"}), 400
    
    files = request.files.getlist('images')
    logger.info(files)
    if not files or files[0].filename == '':
        return jsonify({"error": "No selected files"}), 400
    
    uploaded_images = []
    
    try:
        upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        os.makedirs(upload_path, exist_ok=True)
        
        # Получаем текущие изображения для этого entry_id
        existing_images = get_existing_images(table_name, entry_id)
        next_image_number = len(existing_images) + 1
        
        print(f"files: {len(files)}, existing_images: {len(existing_images)}")
        if len(files) + len(existing_images) > 5:
            return jsonify({"error": "Нельзя загружать больше 5 изображений!"}), 400
        
        for file in files:
            if file and allowed_file(file.filename):
                # Генерируем имя файла: table_name_entry_id_number_timestamp.webp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                file_ext = 'webp'
                filename = secure_filename(f"{table_name}_{entry_id}_{next_image_number}_{timestamp}.{file_ext}")
                filepath = os.path.join(upload_path, filename)
                
                # Обрабатываем изображение
                img = Image.open(file.stream)
                img = fix_image_orientation(img)
                
                if img.width > 1200:
                    ratio = 1200 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((1200, new_height), Image.LANCZOS)
                
                img.save(filepath, 'WEBP', quality=85)
                
                relative_path = os.path.join('uploads', table_name, filename)
                uploaded_images.append(relative_path)
                next_image_number += 1
        
        # Обновляем IMAGE_PATH в основной таблице
        print(f"uploaded_images: {uploaded_images}")
        if uploaded_images:
            # Сохраняем все пути через разделитель или берем первую как основную
            all_images_path = ','.join(uploaded_images)
            print(f"all_images_path: {all_images_path}")
            update_image_path(table_name, entry_id, all_images_path)
                
        return jsonify({
            "success": True,
            "images": [path.lstrip('/') for path in uploaded_images],
            "main_image": uploaded_images[0].lstrip('/') if uploaded_images else None
        })
        
    except Exception as e:
        logger.error(f"Error processing images: {e}")
        return jsonify({"error": str(e)}), 500

def get_existing_images(table_name, entry_id):
    """Получаем существующие изображения для записи"""
    with get_db_cursor() as cursor:
        cursor.execute(
            sql.SQL("SELECT \"IMAGE_PATH\" FROM {} WHERE \"ID\" = %s").format(
                sql.Identifier(table_name)
            ),
            (entry_id,)
        )
        result = cursor.fetchone()
        if result and result[0]:
            # Если пути разделены запятыми, разбиваем на массив
            return result[0].split(',')
        return []

def update_image_path(table_name, entry_id, image_path):
    """Обновляем IMAGE_PATH в основной таблице"""
    with get_db_cursor() as cursor:
        cursor.execute(
            sql.SQL("UPDATE {} SET \"IMAGE_PATH\" = CONCAT_WS(',', NULLIF(\"IMAGE_PATH\", ''), %s) WHERE \"ID\" = %s").format(
                sql.Identifier(table_name)
            ),
            (image_path, entry_id)
        )

def delete_image_path(table_name, entry_id, image_path):
    """Удаляем IMAGE_PATH в основной таблице"""
    with get_db_cursor() as cursor:
        cursor.execute(
            sql.SQL("UPDATE {} SET \"IMAGE_PATH\" = %s WHERE \"ID\" = %s").format(
                sql.Identifier(table_name)
            ),
            (image_path, entry_id)
        )

@api_bp.route('/images/<table_name>/<int:entry_id>', methods=['GET'])
def get_entry_images(table_name, entry_id):
    """Получаем все изображения для записи"""
    try:
        image_paths = get_existing_images(table_name, entry_id)
        return jsonify({
            "images": [url_for('static', filename=path.strip()) for path in image_paths]
        })
    except Exception as e:
        logger.error(f"Error getting images: {e}")
        return jsonify({"error": str(e)}), 500

@api_bp.route('/delete_images/<table_name>/<int:entry_id>', methods=['DELETE'])
def delete_specific_image(table_name, entry_id):
    """Удаляем конкретное изображение по имени файла"""
    try:
        data = request.get_json()
        image_filenames = data.get('image_filenames')
        
        if not image_filenames:
            return jsonify({"error": "Image filename required"}), 400
        
        file_count = len(image_filenames)
        print(f"Получено {file_count} для удаления")
        
        if file_count == 1:
            print("single file")
            
        elif file_count > 1:
            print("array")
        
        # Получаем текущие изображения
        current_images = get_existing_images(table_name, entry_id)
        
        # Удаляем файл с диска
        for filename in image_filenames:
            file_path = os.path.join(current_app.root_path, 'static', filename)
            print(f"жопа: --- {file_path}")
            
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Обновляем запись в БД
        updated_images = [img for img in current_images if img not in image_filenames and os.path.basename(img) not in image_filenames]
        updated_path = ','.join(updated_images) if updated_images else None
        
        delete_image_path(table_name, entry_id, updated_path)
        
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
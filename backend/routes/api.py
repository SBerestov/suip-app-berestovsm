from flask import Blueprint, render_template, request, jsonify, current_app, url_for, send_from_directory
from backend.database import get_db_cursor
import logging
import uuid
from datetime import datetime
from psycopg2 import sql, DatabaseError
import os
from werkzeug.utils import secure_filename
from PIL import Image, ExifTags

# TODO: allowed_file

api_bp = Blueprint('api', __name__)

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

# TODO: /add-form-fields, /add/table, /update/table/:id
    
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

# TODO: /upload_image, /delete_image, /uploads

@api_bp.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({"success": True, "message": "Test successful"}), 200
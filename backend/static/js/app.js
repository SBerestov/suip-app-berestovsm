// Открытие модального окна для добавления
document.querySelectorAll('#openAddForm, .floating-button').forEach(element => {
    element.addEventListener('click', function() {
        const activeTable = document.querySelector('.nav-item.active').dataset.table;
        const menu =  document.querySelector('.menu');
        const overlay = document.querySelector('.overlay');

        if (menu.classList.contains('active') || overlay.style.display == 'block') {
            menu.classList.remove('active');
            overlay.style.display = 'none';
        }

        fetch(`/api/add-form-fields?table=${activeTable}`)
            .then(response => response.json())
            .then(data => {
                if (data.columns && data.columns.length > 0) {
                    startFormWizard(data.columns, data.columns_translated, activeTable);
                } else {
                    alert('Нет доступных полей для добавления');
                }
            })
            .catch(error => console.error('Ошибка', error));
    });
});

// Обработка форм для полей
function startFormWizard(columns, columns_translated, activeTable) {
    // Исключаем COMMENT
    const filteredColumns = columns.filter((col, index) => {
        return col !== 'COMMENT';
    });

    const filteredColumnsTranslated = columns_translated.filter((_, index) => {
        return columns[index] !== 'COMMENT';
    });

    let currentStep = 0;
    const formData = {};
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('blocked');

    function renderStatusField(isLastStep, isSummary = false, currentValue = '') {
        const statusOptions = {
            'works': ['Запланировано', 'В процессе', 'Завершено'],
            'os': ['В работе', 'В обслуживании', 'На складе', 'Выведены из эксплуатации']
        };

        const options = statusOptions[activeTable] || [];

        if (isSummary) {
            return `
                <input type="text" value="${currentValue}" class="status-input-summary">
            `;
        }

        return `
            <div class="status-input-container">
                <select class="status-select" autofocus>
                    ${options.map(opt => `<option>${opt}</option>`).join('')}
                    <option value="other">Другое...</option>
                </select>
                <input type="text" id="custom-status" class="custom-status-input" style="display: none;" placeholder="Введите свой вариант">
                <button type="submit" class="button-on-input" style="display: block; cursor: pointer;">
                    ${isLastStep ? 'Сохранить' : 'Отправить'}
                </button>
            </div>
        `;
    }

    function showStep() {
        if (currentStep >= filteredColumns.length) {
            renderSummary();
            return;
        }

        const column = filteredColumns[currentStep];
        const column_translated = filteredColumnsTranslated[currentStep];
        const isLastStep = currentStep === filteredColumns.length - 1;

        modal.innerHTML = `
            <img class="close" src="${closeImgModal}" height="24" width="24">
            <h2>${column_translated}</h2>
            <form id="one-input-form">
                <div class="input-and-button">
                    ${column === 'STATUS' 
                        ? renderStatusField(isLastStep)
                        : (column === 'EXPLOITATION_DATE' || column === 'PLANNED_DATE' || column === 'RECEIVE_DATE')
                            ? `<div class="date-container"></div>
                                <button type="submit" class="button-on-input" style="display: block; cursor: pointer; align-self: flex-end; padding: 12px 20px;">${isLastStep ? 'Сохранить' : 'Отправить'}</button>`
                            : `<input type="text" id="input" autofocus required>`
                    }
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div class="back-button">
                        <img src="${backImgModal}" height="24" width="24">
                        <span>Назад</span>
                    </div>
                    <div class="step-counter">
                        <span style="color: black; font-size: 30px; line-height: 28px;">0${currentStep + 1} </span>
                        / 0${filteredColumns.length}
                    </div>
                </div>
            </form>
        `;

        if (column === 'STATUS') {
            setupStatusSelectHandlers();
        }

        const backButton = document.querySelector('.back-button');
        if (currentStep <= 0) {
            backButton.querySelector('span').style.display = 'none';
            backButton.querySelector('img').style.display = 'none';
        }

        if (column === 'EXPLOITATION_DATE' || column === 'PLANNED_DATE' || column === 'RECEIVE_DATE') {
            const dateContainer = modal.querySelector('.date-container');
            const dateInput = createDateInputs();
            dateContainer.appendChild(dateInput);
        }

        // Установка фокуса на input
        const input = modal.querySelector('#input');
        if (input) {
            try {
                input.focus();

            } catch (e) {
                console.log(e);
            }
        }

        modal.querySelector('.back-button').addEventListener('click', () => {
            currentStep--;
            showStep();
        });

        modal.querySelector('form').addEventListener('submit', e => {
            e.preventDefault();
            
            let value;
            if (column === 'EXPLOITATION_DATE' || column === 'PLANNED_DATE' || column === 'RECEIVE_DATE') {
                const fullDateInput = e.target.querySelector('#full-date');
                value = fullDateInput.value.trim();
            } else if (column === 'STATUS') {
                const selectElement = e.target.querySelector('.status-select');
                const customInput = e.target.querySelector('#custom-status');
                
                if (selectElement.value === 'other' && customInput.style.display === 'block') {
                    value = customInput.value.trim();
                    if (!value) {
                        alert('Пожалуйста, введите значение статуса');
                        return;
                    }
                } else {
                    value = selectElement.value.trim();
                }
            } else {
                const inputElement = e.target.querySelector('input');
                value = inputElement.value.trim();
            }

            if (value) {
                formData[column] = value;
                currentStep++;
                showStep();
            }
        });

        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
            overlay.classList.remove('blocked');
            document.body.classList.remove('no-scroll');
        });
    }

    function setupStatusSelectHandlers() {
        const stautsSelect = modal.querySelector('.status-select');
        const customStatusInput = modal.querySelector('#custom-status');

        stautsSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                customStatusInput.style.display = 'block';
                customStatusInput.focus();
            } else {
                customStatusInput.style.display = 'none';
            }
        });
    }

    function renderSummary() {
        modal.innerHTML = `
            <div class="modal-header">
                <h2 style="margin: 0;">Проверьте и отредактируйте данные</h2>
                <img class="close" src="${closeImgModal}" height="24" width="24">
            </div>
            <form id="summary-form">
                <div class="modal-content">
                    ${filteredColumns.map((col, i) => {
                        const value = formData[col] || '';
                        return `
                            <div class="modal-field" data-column="${col}">
                                <label>${filteredColumnsTranslated[i]}</label>
                                ${col === 'STATUS' 
                                    ? renderStatusField(true, true, value)
                                    : (col === 'EXPLOITATION_DATE' || col === 'PLANNED_DATE' || col === 'RECEIVE_DATE') 
                                        ? `<div class="date-container" id="date-container-${i}"></div>` 
                                        : `<input type="text" value="${value}">`
                                }
                            </div>
                        `;
                    }).join('')}
                    <div class="modal-field" data-column="COMMENT" style="gap: 5px;">
                        <label>Комментарий</label>
                        <textarea name="comment" class="summary-comment"></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="back-button-modal">Назад</button>
                    <button type="submit" id="confirm-btn">Подтвердить</button>
                </div>
            </form>
        `;

        filteredColumns.forEach((col, i) => {
            if (col === 'EXPLOITATION_DATE' || col === 'PLANNED_DATE' || col === 'RECEIVE_DATE') {
                const container = modal.querySelector(`#date-container-${i}`);

                if (container) {
                    const dateInput = createDateInputs(formData[col]);
                    container.appendChild(dateInput);

                    // Обновляем formData при изменении даты
                    dateInput.addEventListener('change', () => {
                        const fullDate = dateInput.querySelector('#full-date').value;
                        formData[col] = fullDate;
                    });
                }
            }
        });

        modal.querySelectorAll('input:not([type="hidden"]), select').forEach((field, index) => {
            const col = filteredColumns[index];
            if (col && col !== 'EXPLOITATION_DATE' && col !== 'PLANNED_DATE' && col !== 'RECEIVE_DATE') {
                field.addEventListener('input', () => {
                    formData[col] = field.value;
                });
            }
        });

        console.log(formData, activeTable);

        modal.querySelector('.back-button-modal').addEventListener('click', () => {
            currentStep = filteredColumns.length - 1;
            showStep();
        });

        modal.querySelector('form').addEventListener('submit', e => {
            e.preventDefault();
            filteredColumns.forEach(col => {
                const input = modal.querySelector(`[data-column="${col}"] input`);
                if (input) {
                    formData[col] = input.value.trim();
                }
            });
            // Добавление комментария в formData
            formData['COMMENT'] = modal.querySelector('.summary-comment').value;

            sendFormData(formData, activeTable);
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });

        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
            document.body.classList.remove('no-scroll');
        });
    }

    modal.style.display = 'block';
    overlay.style.display = (modal.style.display === 'block') ? 'block' : 'none';
    document.body.classList.add('no-scroll');
    showStep();
}

function createDateInputs(existingDate) {
    let currentDate;
    if (existingDate) {
        const [day, month, year] = existingDate.split('.');
        currentDate = new Date(`${year}-${month}-${day}`);
    } else {
        currentDate = new Date();
    }

    const container = document.createElement('div');
    container.className = 'date-picker';

    // Генерация дней для разных месяцев и годов
    const generateDays = (year, month) => {
        const daysInMonth = new Date(year, month, 0).getDate();
        return Array.from({length: daysInMonth}, (_, i) => `
            <option value="${i+1}" ${i+1 === currentDate.getDate() ? 'selected' : ''}>${i+1}</option>
        `).join('');
    };

    container.innerHTML = `
        <div class="date-group">
            <label class="date-label">День</label>
            <select id="day" class="date-part">${generateDays(currentDate.getFullYear(), currentDate.getMonth() + 1)}</select>
        </div>
        <span class="date-separator">.</span>
        <div class="date-group">
            <label class="date-label">Месяц</label>
            <select id="month" class="date-part">
                ${Array.from({length: 12}, (_, i) => 
                    `<option value="${i+1}" ${i+1 === currentDate.getMonth() + 1 ? 'selected' : ''}>${i+1}</option>`
                ).join('')}
            </select>
        </div>
        <span class="date-separator">.</span>
        <div class="date-group">
            <label class="date-label">Год</label>
            <select id="year" class="date-part">
                ${Array.from({length: 211}, (_, i) => {
                    const year = 1990 + i;
                    return `<option value="${year}" ${year === currentDate.getFullYear() ? 'selected' : ''}>${year}</option>`;
                }).join('')}
            </select>
        </div>
        <input type="hidden" id="full-date" name="date">
    `;

    // Обновление дней при изменении месяца/года
    const updateDays = () => {
        const year = parseInt(container.querySelector('#year').value);
        const month = parseInt(container.querySelector('#month').value);
        const daySelect = container.querySelector('#day');
        const currentDay = parseInt(daySelect.value);
        
        daySelect.innerHTML = generateDays(year, month);
        
        // Сохраняем выбранный день если он существует в новом месяце
        daySelect.value = Math.min(currentDay, new Date(year, month, 0).getDate());
    };

    // Обновление полной даты
    const updateFullDate = () => {
        const day = container.querySelector('#day').value.padStart(2, '0');
        const month = container.querySelector('#month').value.padStart(2, '0');
        const year = container.querySelector('#year').value;
        container.querySelector('#full-date').value = `${day}.${month}.${year}`;
    };

    // Слушатели изменений
    container.querySelector('#month').addEventListener('change', () => {
        updateDays();
        updateFullDate();
    });

    container.querySelector('#year').addEventListener('change', () => {
        updateDays();
        updateFullDate();
    });

    container.querySelector('#day').addEventListener('change', updateFullDate);

    // Инициализация
    updateFullDate();

    return container;
}

function sendFormData(data, table) {
    fetch(`/api/add/${table}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const successMessage = document.querySelector('.success-message');

            // Вызов об успешной записи в БД
            showSuccessMessage(table, successMessage, "сохраненны");

            setTimeout(() => {
                successMessage.style.display = 'none';
                window.location.reload();
            }, 800);
        } else {
            alert(result.error || 'Неизвестная ошибка');
        }
    })
    .catch(error => console.error('Ошибка:', error));
}

function showSuccessMessage(table, successMessage, messageType) {
    const h2Element = successMessage.querySelector('h2');
    const spanElement = document.createElement('span');

    spanElement.textContent = messageType;
    if (messageType === 'удалены') {
        spanElement.style.color = '#FF0000';
    } else {
        spanElement.style.color = '#3DADFF';
    }

    h2Element.textContent = `Данные успешно `;
    h2Element.appendChild(spanElement);
    h2Element.append(` в ${table}!`);
    
    successMessage.style.display = 'grid';
}

// Очистка поиска при перезагрузке
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput.value.trim() !== '') {
        clearButton.style.display = 'block';
    } else {
        clearButton.style.display = 'none';
    }
});

// Очистка поиска при вводе текста
document.getElementById('searchInput').addEventListener('input', function() {
    const clearButton = document.getElementById('clearSearch');

    if (this.value.trim() !== '') {
        clearButton.style.display = 'block';
    } else {
        clearButton.style.display = 'none';
    }
});

document.getElementById('clearSearch').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    this.style.display = 'none';
});

// Поиск с дебаунсером
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    let timeoutId;

    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });

    function performSearch(query) {
        const url = new URL(window.location.href);
        url.searchParams.set('search', query);

        // Обновляем url
        history.replaceState(null, '', url.toString());

        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newTable = doc.querySelector('#tableContainer').innerHTML;
                document.getElementById('tableContainer').innerHTML = newTable;
            })
            .catch(error => console.error('Error:', error));
    }
});

// Ленивая загрузка картинок
document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// Открытие меню на мобильных устройствах
const menuImg = document.querySelector('.menu-sidebar');
const itemForm = document.querySelector('.item-form');
const modalForm = document.querySelector('.modal');
const menu =  document.querySelector('.menu');
const overlay = document.querySelector('.overlay');
const closeImg = document.querySelector('#closeImg')
const closeForm = document.querySelector('.close-form');

function openMenu() {
    menu.classList.add('active');
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
}

function closeMenu() {
    if (itemForm.style.display === 'block' || modalForm.style.display === 'block') {
        itemForm.style.display = 'none';
        modalForm.style.display = 'none';
    }
    menu.classList.remove('active');
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

menuImg.addEventListener('click', openMenu);
closeImg.addEventListener('click', closeMenu);
closeForm.addEventListener('click', closeMenu);
overlay.addEventListener('click', () => {
    if (!overlay.classList.contains('blocked')) {
        closeMenu();
    }
});

// Управление тенью при скроле в item-data
document.querySelectorAll('.list-item').forEach(container => {
    const scrollItem = container.querySelector('.item-data');

    scrollItem.addEventListener('scroll', function() {
        const scrollLeft = this.scrollLeft;
        const maxScroll = this.scrollWidth - this.clientWidth;

        if (scrollLeft <= 0) {
            this.classList.add('scroll-start');
            this.classList.remove('scroll-middle');
        } else if (scrollLeft >= maxScroll) {
            this.classList.add('scroll-end');
            this.classList.remove('scroll-middle');
        } else {
            this.classList.add('scroll-middle');
            this.classList.remove('scroll-start', 'scroll-end');
        }
    });

    const event = new Event('scroll');
    scrollItem.dispatchEvent(event);
});

// Горизонтальный скролл перетаскиванием по .item-data
const itemDataElements = document.querySelectorAll('.item-data');

itemDataElements.forEach(element => {
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    element.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
        element.style.cursor = 'grabbing';
        isDragging = false;
    });

    element.addEventListener('mouseleave', () => {
        isDown = false;
        element.style.cursor = 'grab';
    });

    element.addEventListener('mouseup', () => {
        isDown = false;
        element.style.cursor = 'grab';
        // Если был драг, предотвращаем клик
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
        }
        isDragging = false;
    });

    element.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        isDragging = true;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const walk = x - startX;
        element.scrollLeft = scrollLeft - walk;
    });

    // Отменяем клик, если был драг
    element.addEventListener('click', (e) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});

// Обработчик клика по элементу списка
document.querySelectorAll('.list-item').forEach(item => {
    item.addEventListener('click', function(e) {
        const entryId = this.dataset.id;
        const activeTable = document.querySelector('.nav-item.active').dataset.table;

        document.body.classList.add('no-scroll');

        async function loadDataItemForm() {
            try {
                const getItemData = await fetch(`/api/${activeTable}/${entryId}`);
                const itemData = await getItemData.json();

                const getTranslatedItemData = await fetch(`/api/add-form-fields?table=${activeTable}`);
                const translatedItemData = await getTranslatedItemData.json();

                if (itemData.error || translatedItemData.error) {
                    alert('Ошибка в запросах на сервер!');
                    return;
                }

                showItemForm(itemData, activeTable, translatedItemData.columns_translated);

            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось загрузить данные!');
            }
        }

        loadDataItemForm();
    });
});

function showItemForm(data, table, translatedColumns) {
    const form = document.querySelector('.item-form');
    const content = document.querySelector('.form-content');
    const overlay = document.querySelector('.overlay');

    console.log(translatedColumns);
    console.log(data);

    content.innerHTML = '';

    const imageField = document.createElement('div');
    imageField.classList.add('current-image');
    imageField.innerHTML = `
        <img id="currentImage" src="${data.IMAGE_PATH ? '/static/' + data.IMAGE_PATH : '/static/images/krisa.webp'}" >
        <button id="changeImageBtn">Изменить</button>
    `;
    content.appendChild(imageField);

    Object.entries(data)
        .filter(([key]) => (key !== 'COMMENT' && key !== 'IMAGE_PATH'))
        .forEach(([key, value]) => {
            const field = document.createElement('div');
            field.classList.add('form-field');
            field.innerHTML = `
                <label>${key}</label>
                <input type="text" value="${value || '-'}" ${key === 'ID' ? 'readonly' : ''}>
            `;
            content.appendChild(field);
        });
    
    const commentField = document.createElement('div');
    commentField.classList.add('form-field', 'comment-field');
    commentField.innerHTML = `
        <label style="padding-bottom: 5px;">COMMENT</label>
        <textarea name="comment" class="summary-comment">${data.COMMENT}</textarea>
    `
    content.appendChild(commentField);
    
    form.style.display = 'block';
    overlay.style.display = 'block';

    // Обработчики для изображения
    document.getElementById('currentImage').addEventListener('click', openImageModal);
    document.getElementById('changeImageBtn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openImageModal();
    });
    
    // Инициализация данных для модального окна
    window.currentImageData = {
        table: table,
        entryId: data.ID,
        currentPath: data.IMAGE_PATH
    };

    const submitButton = form.querySelector('.btn-edit');
    const formFields = form.querySelectorAll('.form-field input, .form-field textarea, .form-field select');
    let hasChanges = false;

    formFields.forEach(field => {
        field.addEventListener('input', () => {
            hasChanges = true;
            updateSubmitButton();
        });
    });

    function updateSubmitButton() {
        if (hasChanges) {
            submitButton.classList.add('active-button');
            submitButton.querySelector('#changeGray').style.display = 'none';
            submitButton.querySelector('#changeWhite').style.display = 'block';
        } else {
            submitButton.classList.remove('active-button');
            submitButton.querySelector('#changeGray').style.display = 'block';
            submitButton.querySelector('#changeWhite').style.display = 'none';
        }
    }

    form.querySelector('.close-form').onclick = function() {
        form.style.display = 'none';
        overlay.style.display = 'none';
    }
    form.querySelector('.btn-delete').onclick = () => deleteEntry(data.ID, table);
    form.querySelector('.btn-edit').onclick = (event) => {
        const button = event.currentTarget;

        if (button.classList.contains('active-button') && event.target.closest('.btn-edit')) {
            editEntry(data.ID, table);
        }
    };
}

function deleteEntry(id, table) {
    console.log(id, table);

    const successMessage = document.querySelector('.success-message');

    if (confirm('Вы уверены, что хотите удалить запись?')) {
        fetch(`/api/delete/${table}/${id}`, { method: 'DELETE' })
            .then(response => {
                if(response.ok) {
                    closeMenu();
                    showSuccessMessage(table, successMessage, "удалены");
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 800);
                }
            });
    }
}

function editEntry(id, table) {
    const formData = new FormData();
    const inputs = document.querySelectorAll('.form-field input');
    const commentField = document.querySelector('.form-field textarea');
    const successMessage = document.querySelector('.success-message');
    const fileInput = document.getElementById('fileInput');

    document.querySelectorAll('.form-field input, .form-field textarea, .form-field select').forEach(field => {
        formData.append(field.name || field.previousElementSibling.textContent, field.value);
    });

    if (fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
    }

    if (confirm('Вы уверены, что хотите изменить запись?')) {
        fetch(`/api/update/${table}/${id}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeMenu();
                showSuccessMessage(table, successMessage, "сохранены");
                setTimeout(() => window.location.reload(), 800);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при сохранении');
        });
    }
}

function openImageModal() {
    const modal = document.getElementById('imageModal');
    const preview = document.getElementById('previewImage');
    const currentImageData = window.currentImageData;

    if (currentImageData.currentPath) {
        preview.src = '/static/' + currentImageData.currentPath;
        preview.style.display = 'inline';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    setupImageUpload();
}

function setupImageUpload() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const modal = document.getElementById('imageModal');

    if (!dropArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefault, false);
    });

    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.style.backgroundColor = '#e1f0ff';
    }

    function unhighlight() {
        dropArea.style.backgroundColor = '';
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefault);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight);
    });

    // Обработка сброса файла
    dropArea.addEventListener('drop', handleDrop);
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }

    function handleFiles(e) {
        const file = e.target.files[0];
        if (!file || !file.type.match('image.*')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Удаление изображения
    removeImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        previewImage.src = '';
        previewImage.style.display = 'none';
        fileInput.value = '';
    });

    // Сохранение изображения
    saveImageBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        const { table, entryId } = window.currentImageData;
        
        if (file) {
            uploadImage(table, entryId, file);
        } else if (previewImage.style.display === 'none') {
            // Удаление изображения
            deleteImage(table, entryId);
        } else {
            modal.style.display = 'none';
        }
    });

    // Закрытие модального окна
    document.querySelector('.close-image-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

function uploadImage(table, id, file) {
    const formData = new FormData();
    formData.append('image', file);
    
    fetch(`/api/upload_image/${table}/${id}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.currentImageData.currentPath = data.image_url.replace('/static/', '');
            document.getElementById('currentImage').src = data.image_url;
            document.getElementById('imageModal').style.display = 'none';
        }
    })
    .catch(error => console.error('Error:', error));
}

function deleteImage(table, id) {
    fetch(`/api/delete_image/${table}/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.currentImageData.currentPath = null;
            document.getElementById('currentImage').src = '/static/images/krisa.webp';
            document.getElementById('imageModal').style.display = 'none';
        }
    });
}

// Заметки floating-container
function  initializeNotes() {
    const notesPanel = document.getElementById('notesPanel');
    const notesTextarea = notesPanel.querySelector('textarea');

    notesTextarea.value = localStorage.getItem('inventory_notes') || '';

    notesTextarea.addEventListener('input', () => {
        localStorage.setItem('inventory_notes', notesTextarea.value);
    });

    function toggleNotes() {
        notesPanel.style.display = notesPanel.style.display === 'block' ? 'none' : 'block';
    }
}
// document.addEventListener('DOMContentLoaded', initializeNotes);
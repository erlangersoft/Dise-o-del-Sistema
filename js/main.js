/* ===================================
   PlantUML Tutorial - Funcionalidades JavaScript
   ================================== */

// ===================================
// VARIABLES GLOBALES
// ===================================
let currentPage = 'intro';

// ===================================
// INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializePageLoad();
    enhanceNavigation();
    console.log('PlantUML Tutorial initialized with enhanced navigation');
    
    // Verificar que plantuml-encoder se carga correctamente
    setTimeout(() => {
        if (typeof plantumlEncoder !== 'undefined') {
            console.log('✅ plantuml-encoder cargado correctamente');
        } else {
            console.warn('⚠️ plantuml-encoder no está disponible. Verifica la conexión.');
        }
    }, 1000);
});

// ===================================
// NAVEGACIÓN
// ===================================
function initializeNavigation() {
    const buttons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.section');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            const targetHref = this.getAttribute('href');
            
            // Si es un enlace a otra página
            if (targetHref && targetHref.includes('.html')) {
                navigateToPage(targetHref);
                return;
            }
            
            // Navegación dentro de la misma página
            if (targetSection) {
                navigateToSection(targetSection, buttons, sections);
            }
        });
    });
}

function navigateToSection(targetSection, buttons, sections) {
    // Actualizar botones de navegación
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${targetSection}"]`)?.classList.add('active');
    
    // Mostrar sección correspondiente
    sections.forEach(section => section.classList.remove('active'));
    const targetSectionElement = document.getElementById(targetSection);
    if (targetSectionElement) {
        targetSectionElement.classList.add('active');
        currentPage = targetSection;
    }
    
    // Actualizar URL sin recargar página
    history.pushState({page: targetSection}, '', `#${targetSection}`);
}

function navigateToPage(href) {
    // Animación de salida suave
    document.body.style.opacity = '0.7';
    
    setTimeout(() => {
        window.location.href = href;
    }, 200);
}

// ===================================
// CARGA DE PÁGINA
// ===================================
function initializePageLoad() {
    // Verificar si hay un hash en la URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetSection = document.getElementById(hash);
        if (targetSection) {
            // Activar la sección correspondiente
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            targetSection.classList.add('active');
            
            // Activar el botón correspondiente
            document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-section="${hash}"]`)?.classList.add('active');
            
            currentPage = hash;
        }
    }
    
    // Animación de entrada suave
    document.body.style.opacity = '1';
}

// Manejar navegación del navegador (botón atrás/adelante)
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        const buttons = document.querySelectorAll('.nav-button');
        const sections = document.querySelectorAll('.section');
        navigateToSection(event.state.page, buttons, sections);
    }
});

// ===================================
// RENDERIZADO DE DIAGRAMAS PLANTUML
// ===================================
function renderDiagram(codeId, previewId) {
    const codeElement = document.getElementById(codeId);
    const previewElement = document.getElementById(previewId);
    
    if (!codeElement || !previewElement) {
        console.error('Elementos no encontrados:', codeId, previewId);
        return;
    }
    
    const code = codeElement.value.trim();
    
    if (!code) {
        previewElement.innerHTML = '<span class="error">Por favor, ingresa código PlantUML</span>';
        return;
    }
    
    previewElement.innerHTML = '<span class="loading">Generando diagrama...</span>';
    
    try {
        // Validar que el código tenga la estructura básica
        if (!code.includes('@startuml') || !code.includes('@enduml')) {
            throw new Error('El código debe comenzar con @startuml y terminar con @enduml');
        }
        
        // Usar la nueva implementación con plantuml-encoder
        renderDiagramWithEncoder(code, previewElement);
        
    } catch (error) {
        previewElement.innerHTML = `<span class="error">Error: ${error.message}</span>`;
        console.error('Error al renderizar diagrama:', error);
    }
}

// ===================================
// NUEVO RENDERIZADO CON PLANTUML-ENCODER
// ===================================
function renderDiagramWithEncoder(code, previewElement) {
    console.log('🎯 Iniciando renderizado con plantuml-encoder');
    previewElement.innerHTML = '<span class="loading">🔄 Generando diagrama con plantuml-encoder...</span>';
    
    try {
        // Verificar que plantuml-encoder esté disponible
        if (typeof plantumlEncoder === 'undefined') {
            throw new Error('plantuml-encoder no está cargado. Verifica la conexión a internet.');
        }
        
        // Codificar usando plantuml-encoder
        const encodedCode = plantumlEncoder.encode(code);
        console.log('✅ Código codificado correctamente:', encodedCode.substring(0, 30) + '...');
        
        // Generar URL correcta para PlantUML
        const imageUrl = `https://www.plantuml.com/plantuml/png/${encodedCode}`;
        console.log('🌐 URL generada:', imageUrl.substring(0, 60) + '...');
        
        // Crear elemento de imagen
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Diagrama PlantUML';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        
        // Manejar carga exitosa
        img.onload = function() {
            console.log('✅ Diagrama renderizado exitosamente');
            previewElement.innerHTML = '';
            previewElement.appendChild(img);
            addDiagramControls(previewElement, imageUrl, code);
        };
        
        // Manejar error de carga
        img.onerror = function() {
            console.log('❌ Error al cargar desde servidor principal, probando alternativo...');
            tryAlternativeServerWithEncoder(code, previewElement, encodedCode);
        };
        
    } catch (error) {
        console.error('❌ Error en renderizado:', error);
        showErrorMessage(previewElement, error.message, code);
    }
}

// Probar servidor alternativo con el mismo código codificado
function tryAlternativeServerWithEncoder(code, previewElement, encodedCode) {
    console.log('🔄 Probando servidor alternativo...');
    
    // Usar servidor alternativo de PlantUML
    const altUrl = `https://plantuml-server.kkeisuke.com/png/${encodedCode}`;
    
    const img = document.createElement('img');
    img.src = altUrl;
    img.alt = 'Diagrama PlantUML';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #ddd';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    
    img.onload = function() {
        console.log('✅ Servidor alternativo funcionó');
        previewElement.innerHTML = '';
        previewElement.appendChild(img);
        addDiagramControls(previewElement, altUrl, code);
    };
    
    img.onerror = function() {
        console.log('❌ Ambos servidores fallaron');
        showErrorMessage(previewElement, 'Los servidores PlantUML no están disponibles', code);
    };
}

// Mostrar mensaje de error amigable
function showErrorMessage(previewElement, message, code) {
    previewElement.innerHTML = `
        <div style="padding: 20px; background: linear-gradient(135deg, #ff6b6b, #ffd93d); border-radius: 12px; color: white; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; font-size: 18px;">⚠️ Error de Renderizado</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.9;">${message}</p>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">🔧 Soluciones alternativas:</p>
                <a href="https://www.plantuml.com/plantuml/uml/" target="_blank" 
                   style="color: white; text-decoration: underline; margin: 0 10px; font-weight: bold;">
                   📝 Editor Online PlantUML
                </a>
                <a href="https://kroki.io/" target="_blank" 
                   style="color: white; text-decoration: underline; margin: 0 10px; font-weight: bold;">
                   🎨 Kroki.io
                </a>
            </div>
            
            <button onclick="copyCodeToClipboard('${code.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')" 
                    style="background: rgba(255,255,255,0.3); color: white; border: 2px solid white; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; margin: 5px;">
                📋 Copiar Código
            </button>
            <button onclick="location.reload()" 
                    style="background: rgba(255,255,255,0.3); color: white; border: 2px solid white; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; margin: 5px;">
                🔄 Reintentar
            </button>
        </div>
    `;
}

// Agregar controles para el diagrama generado
function addDiagramControls(container, imageUrl, code) {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
        margin-top: 15px; 
        text-align: center; 
        padding: 15px; 
        background: linear-gradient(135deg, #667eea, #764ba2); 
        border-radius: 10px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    `;
    
    // Botón descargar
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '💾 Descargar PNG';
    downloadBtn.style.cssText = `
        background: rgba(255,255,255,0.2); 
        color: white; 
        border: 2px solid white; 
        padding: 10px 20px; 
        border-radius: 25px; 
        cursor: pointer; 
        font-weight: bold; 
        transition: all 0.3s ease;
        flex: 0 1 auto;
        min-width: 120px;
        white-space: nowrap;
    `;
    downloadBtn.onclick = () => downloadDiagramImage(imageUrl);
    downloadBtn.onmouseover = () => downloadBtn.style.background = 'rgba(255,255,255,0.3)';
    downloadBtn.onmouseout = () => downloadBtn.style.background = 'rgba(255,255,255,0.2)';
    
    // Botón copiar código
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '📋 Copiar Código';
    copyBtn.style.cssText = downloadBtn.style.cssText;
    copyBtn.onclick = () => copyCodeToClipboard(code);
    copyBtn.onmouseover = () => copyBtn.style.background = 'rgba(255,255,255,0.3)';
    copyBtn.onmouseout = () => copyBtn.style.background = 'rgba(255,255,255,0.2)';
    
    // Botón ver en nueva pestaña
    const viewBtn = document.createElement('button');
    viewBtn.innerHTML = '🔍 Ver en Nueva Pestaña';
    viewBtn.style.cssText = downloadBtn.style.cssText;
    viewBtn.onclick = () => window.open(imageUrl, '_blank');
    viewBtn.onmouseover = () => viewBtn.style.background = 'rgba(255,255,255,0.3)';
    viewBtn.onmouseout = () => viewBtn.style.background = 'rgba(255,255,255,0.2)';
    
    controlsDiv.appendChild(downloadBtn);
    controlsDiv.appendChild(copyBtn);
    controlsDiv.appendChild(viewBtn);
    container.appendChild(controlsDiv);
}

// Función para descargar imagen
function downloadDiagramImage(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantuml-diagram-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessNotification('🎉 Diagrama descargado exitosamente');
}

// Función para copiar código al portapapeles
function copyCodeToClipboard(code) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            showSuccessNotification('📋 Código copiado al portapapeles');
        }).catch(() => {
            fallbackCopyToClipboard(code);
        });
    } else {
        fallbackCopyToClipboard(code);
    }
}

// Función de respaldo para copiar al portapapeles
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccessNotification('📋 Código copiado al portapapeles');
}

// Mostrar notificación de éxito
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}








function addImageControls(container, imageUrl, code) {
    const controls = document.createElement('div');
    controls.style.marginTop = '10px';
    controls.style.textAlign = 'center';
    
    // Botón para descargar imagen
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '💾 Descargar PNG';
    downloadBtn.className = 'render-btn';
    downloadBtn.style.marginRight = '10px';
    downloadBtn.onclick = () => downloadImage(imageUrl);
    
    // Botón para copiar código
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copiar Código';
    copyBtn.className = 'render-btn';
    copyBtn.onclick = () => copyToClipboard(code);
    
    controls.appendChild(downloadBtn);
    controls.appendChild(copyBtn);
    container.appendChild(controls);
}

function downloadImage(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagrama-plantuml.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Código copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Código copiado al portapapeles', 'success');
    });
}



// ===================================
// UTILIDADES DE UI
// ===================================
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos básicos
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease-out'
    });
    
    // Color según tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===================================
// MEJORAS DE EXPERIENCIA DE USUARIO
// ===================================
function initializeTextareaEnhancements() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        // Agregar numeración de líneas (visual)
        textarea.addEventListener('input', function() {
            adjustTextareaHeight(this);
        });
        
        // Shortcuts de teclado
        textarea.addEventListener('keydown', function(e) {
            // Ctrl+Enter para renderizar
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const renderBtn = this.parentNode.querySelector('.render-btn');
                if (renderBtn) {
                    renderBtn.click();
                }
            }
            
            // Tab para indentación
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
        
        // Autocompletado básico
        textarea.addEventListener('input', function(e) {
            handleAutoComplete(this, e);
        });
    });
}

function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function handleAutoComplete(textarea, event) {
    const cursor = textarea.selectionStart;
    const text = textarea.value;
    const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
    const currentLine = text.substring(lineStart, cursor);
    
    // Autocompletado simple para estructuras comunes
    const completions = {
        '@start': '@startuml\n\n@enduml',
        'participant': 'participant "Actor Name" as Actor',
        'class': 'class ClassName {\n    -attribute: type\n    +method()\n}',
        'usecase': 'usecase "Use Case Name" as UC1'
    };
    
    for (const [trigger, completion] of Object.entries(completions)) {
        if (currentLine.trim() === trigger && event.data === ' ') {
            event.preventDefault();
            const beforeCursor = text.substring(0, lineStart);
            const afterCursor = text.substring(cursor);
            textarea.value = beforeCursor + completion + afterCursor;
            textarea.selectionStart = textarea.selectionEnd = lineStart + completion.length;
            break;
        }
    }
}

// ===================================
// VALIDACIÓN DE CÓDIGO PLANTUML
// ===================================
function validatePlantUMLCode(code) {
    const errors = [];
    
    if (!code.trim()) {
        errors.push('El código no puede estar vacío');
        return errors;
    }
    
    if (!code.includes('@startuml')) {
        errors.push('El código debe comenzar con @startuml');
    }
    
    if (!code.includes('@enduml')) {
        errors.push('El código debe terminar con @enduml');
    }
    
    // Validaciones específicas según el tipo de diagrama
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('\'') && !line.startsWith('//')) {
            // Aquí se pueden agregar más validaciones específicas
        }
    }
    
    return errors;
}

// ===================================
// INICIALIZACIÓN DESPUÉS DE CARGA
// ===================================
window.addEventListener('load', function() {
    initializeTextareaEnhancements();
    
    // Agregar efecto de carga completada
    document.body.classList.add('loaded');
});

// ===================================
// MEJORAS DE NAVEGACIÓN AVANZADA
// ===================================

// Enhanced navigation with smooth transitions
function enhanceNavigation() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add page transition effects
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.href && !this.href.includes('#')) {
                e.preventDefault();
                const targetUrl = this.href;
                
                // Add fade effect
                document.body.style.opacity = '0.7';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 200);
            }
        });
    });
    
    // Add contextual navigation hints
    addNavigationHints();
    
    // Add progress tracking
    addProgressTracking();
}

// Add contextual navigation hints
function addNavigationHints() {
    const currentPath = window.location.pathname;
    const pages = [
        { path: 'index.html', name: 'Introducción', next: 'pages/sequence.html' },
        { path: 'sequence.html', name: 'Secuencia', prev: '../index.html', next: 'class.html' },
        { path: 'class.html', name: 'Clases', prev: 'sequence.html', next: 'usecase.html' },
        { path: 'usecase.html', name: 'Casos de Uso', prev: 'class.html', next: 'activity.html' },
        { path: 'activity.html', name: 'Actividad', prev: 'usecase.html', next: 'state.html' },
        { path: 'state.html', name: 'Estado', prev: 'activity.html', next: 'component.html' },
        { path: 'component.html', name: 'Componentes', prev: 'state.html', next: 'tips.html' },
        { path: 'tips.html', name: 'Tips', prev: 'component.html', next: null }
    ];
    
    const currentPage = pages.find(page => currentPath.includes(page.path));
    if (currentPage) {
        addPageNavigation(currentPage);
    }
}

// Add previous/next page navigation
function addPageNavigation(currentPage) {
    const mainContent = document.querySelector('.main');
    if (!mainContent) return;
    
    const navContainer = document.createElement('div');
    navContainer.className = 'page-navigation';
    navContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
        padding: 20px 0;
        border-top: 1px solid #e0e0e0;
    `;
    
    if (currentPage.prev) {
        const prevButton = document.createElement('a');
        prevButton.href = currentPage.prev;
        prevButton.className = 'nav-prev';
        prevButton.innerHTML = '← Página Anterior';
        prevButton.style.cssText = `
            color: #667eea;
            text-decoration: none;
            padding: 10px 20px;
            border: 1px solid #667eea;
            border-radius: 5px;
            transition: all 0.3s ease;
        `;
        prevButton.addEventListener('mouseover', () => {
            prevButton.style.backgroundColor = '#667eea';
            prevButton.style.color = 'white';
        });
        prevButton.addEventListener('mouseout', () => {
            prevButton.style.backgroundColor = 'transparent';
            prevButton.style.color = '#667eea';
        });
        navContainer.appendChild(prevButton);
    }
    
    if (currentPage.next) {
        const nextButton = document.createElement('a');
        nextButton.href = currentPage.next;
        nextButton.className = 'nav-next';
        nextButton.innerHTML = 'Siguiente Página →';
        nextButton.style.cssText = `
            color: #667eea;
            text-decoration: none;
            padding: 10px 20px;
            border: 1px solid #667eea;
            border-radius: 5px;
            transition: all 0.3s ease;
            margin-left: auto;
        `;
        nextButton.addEventListener('mouseover', () => {
            nextButton.style.backgroundColor = '#667eea';
            nextButton.style.color = 'white';
        });
        nextButton.addEventListener('mouseout', () => {
            nextButton.style.backgroundColor = 'transparent';
            nextButton.style.color = '#667eea';
        });
        navContainer.appendChild(nextButton);
    }
    
    mainContent.appendChild(navContainer);
}

// Add progress tracking
function addProgressTracking() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-tracker';
    progressContainer.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    `;
    
    const navButtons = document.querySelectorAll('.nav-button');
    const totalPages = navButtons.length;
    const currentPage = document.querySelector('.nav-button.active');
    let currentIndex = 0;
    
    navButtons.forEach((button, index) => {
        if (button.classList.contains('active')) {
            currentIndex = index + 1;
        }
    });
    
    progressContainer.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Progreso del Tutorial</h4>
        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: #667eea; height: 100%; width: ${(currentIndex / totalPages) * 100}%; transition: width 0.3s ease;"></div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">${currentIndex}/${totalPages} páginas completadas</p>
    `;
    
    sidebar.appendChild(progressContainer);
}

// ===================================
// FUNCIONES GLOBALES EXPUESTAS
// ===================================
window.PlantUMLTutorial = {
    renderDiagram,
    navigateToPage,
    showNotification,
    validatePlantUMLCode,
    enhanceNavigation,
    currentPage: () => currentPage
};
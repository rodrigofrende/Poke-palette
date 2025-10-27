# 🧪 Cómo Probar el Rediseño Mobile-First

## 🚀 Inicio Rápido

### 1. Instalar Dependencias (si es necesario)

```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor debería iniciar en `http://localhost:5173` (o el puerto que Vite asigne).

### 3. Abrir en el Navegador

Abre tu navegador y navega a la URL mostrada en la terminal.

---

## 📱 Probar en Diferentes Dispositivos

### Usando Chrome DevTools (Recomendado)

1. **Abrir DevTools**: 
   - Windows/Linux: `F12` o `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

2. **Activar Toggle Device Toolbar**:
   - Windows/Linux: `Ctrl+Shift+M`
   - Mac: `Cmd+Shift+M`

3. **Seleccionar Dispositivo**:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPhone 14 Pro Max (430x932)
   - Pixel 5 (393x851)
   - iPad Air (820x1180)
   - iPad Pro (1024x1366)

4. **Probar Rotación**:
   - Click en el icono de rotación
   - Prueba portrait y landscape

### Probar en Dispositivos Reales

#### iOS (iPhone/iPad)

**Opción 1: Mismo WiFi**
```bash
# En tu terminal, busca tu IP local
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Luego en tu iPhone/iPad, abre Safari y navega a:
```
http://TU_IP_LOCAL:5173
```

**Opción 2: ngrok (Para acceso remoto)**
```bash
# Instalar ngrok
npm install -g ngrok

# En otra terminal (mientras dev server corre)
ngrok http 5173
```

Usa la URL `https://` que ngrok proporciona en tu dispositivo.

#### Android

Similar a iOS, pero usa Chrome en Android.

---

## 🎯 Flujo de Testing Sugerido

### Paso 1: Verificar Paso 2 (Generación de Paleta)

1. **Buscar un Pokémon**:
   ```
   - Busca "pikachu"
   - Selecciona de la lista
   - Click en "Analizar"
   ```

2. **Verificar Stats Header**:
   - ✅ ¿Muestra número correcto de colores?
   - ✅ ¿Muestra temperatura (Cálida/Fría/Neutra)?
   - ✅ ¿Muestra armonía (Alta/Media/Baja)?

3. **Probar Action Cards**:
   - ✅ Click en "Aplicar Tema"
   - ✅ Verifica que la app cambie de colores
   - ✅ Click en "Restaurar"
   - ✅ Verifica que vuelva al tema original

4. **Probar Color Cards**:
   
   **Vista Compacta:**
   - ✅ Verifica que muestre HEX
   - ✅ Verifica badge de sugerencia
   - ✅ Verifica barra de porcentaje
   - ✅ Click en la card

   **Vista Expandida:**
   - ✅ Verifica HEX, RGB, HSL
   - ✅ Click en botones de copiar (cada uno)
   - ✅ Verifica notificación toast
   - ✅ Abre color picker
   - ✅ Cambia el color
   - ✅ Verifica que aparezca botón restaurar
   - ✅ Click en restaurar
   - ✅ Verifica que vuelva al original

5. **Probar "Expandir Todo"**:
   - ✅ Click en botón
   - ✅ Verifica que todas las cards se expandan
   - ✅ Texto debe cambiar a "Colapsar Todo"
   - ✅ Click nuevamente
   - ✅ Verifica que todas colapsen

6. **Probar Exportación**:
   - ✅ Click en botón toggle
   - ✅ Verifica que muestre opciones
   - ✅ Verifica que icono rote
   - ✅ Click en copiar algún código
   - ✅ Verifica notificación

### Paso 2: Verificar Paso 3 (Análisis de Contraste)

1. **Navegar al Paso 3**:
   ```
   - Click en "Siguiente" o en el step 3 del header
   ```

2. **Verificar Score Hero**:
   - ✅ ¿Muestra puntuación sobre 100?
   - ✅ ¿Color del círculo apropiado? (Verde/Azul/Amarillo/Rojo)
   - ✅ ¿Descripción correcta?

3. **Verificar Quick Stats**:
   - ✅ ¿Aprobados cuenta correctamente?
   - ✅ ¿Fallidos cuenta correctamente?
   - ✅ ¿Promedio es razonable?

4. **Probar Filtros**:
   - ✅ Click en "Todos" - muestra todos
   - ✅ Click en "Aprobados" - filtra correctamente
   - ✅ Click en "Fallidos" - muestra solo problemas
   - ✅ Verifica contadores en cada tab

5. **Verificar Contrast Cards**:
   
   **Header:**
   - ✅ Color swatch muestra color correcto
   - ✅ Click en swatch copia color
   - ✅ HEX code correcto
   - ✅ Badge de estado visible

   **Tests:**
   - ✅ Preview texto blanco legible
   - ✅ Preview texto negro legible
   - ✅ Ratios mostrados correctamente
   - ✅ Badges WCAG correctos

   **Recomendaciones:**
   - ✅ Para colores fallidos: sugerencia visible
   - ✅ Para colores aprobados: confirmación visible

6. **Verificar Panel WCAG**:
   - ✅ Información correcta mostrada
   - ✅ Diseño visual atractivo

---

## 🎨 Escenarios de Prueba Específicos

### Escenario 1: Paleta Monocromática

**Objetivo**: Probar con paleta de baja armonía

```
1. Buscar: "gengar"
2. Analizar
3. Verificar que Stats Header muestre "Baja" armonía
4. Verificar que temperatura sea apropiada
```

**Resultado Esperado**:
- ✅ Armonía: Baja 🎯
- ✅ Temperatura: Fría ❄️ (colores púrpura/negro)

### Escenario 2: Paleta Multicolor

**Objetivo**: Probar con paleta de alta armonía

```
1. Buscar: "eevee"
2. Analizar
3. Verificar que muestre alta armonía
```

**Resultado Esperado**:
- ✅ Armonía: Alta 🌈
- ✅ Múltiples colores visibles

### Escenario 3: Editar y Restaurar Color

**Objetivo**: Probar funcionalidad de edición

```
1. Generar cualquier paleta
2. Expandir primer color
3. Abrir color picker
4. Cambiar a un color muy diferente
5. Verificar que botón restaurar aparece
6. Click en restaurar
```

**Resultado Esperado**:
- ✅ Color cambia visualmente
- ✅ Botón ↩️ aparece
- ✅ Restaurar vuelve al original
- ✅ Botón ↩️ desaparece

### Escenario 4: Filtrar Problemas de Contraste

**Objetivo**: Encontrar colores problemáticos rápidamente

```
1. Generar paleta (cualquiera)
2. Ir a Paso 3
3. Click en tab "Fallidos"
```

**Resultado Esperado**:
- ✅ Solo muestra colores que no pasan WCAG
- ✅ Recomendaciones visibles
- ✅ Contador correcto

### Escenario 5: Copiar Diferentes Formatos

**Objetivo**: Verificar copy functionality

```
1. Generar paleta
2. Expandir primer color
3. Copiar HEX
4. Verificar notificación
5. Copiar RGB
6. Verificar notificación
7. Copiar HSL
8. Verificar notificación
```

**Resultado Esperado**:
- ✅ Cada formato copia correctamente
- ✅ Notificación muestra valor copiado
- ✅ Formato preservado (puedes pegar en editor)

---

## 📱 Testing Responsive Específico

### Mobile Small (< 380px)

**Dispositivos**: iPhone SE (375px)

```
1. Abrir DevTools
2. Seleccionar iPhone SE
3. Verificar que:
   - Stats en columna única
   - Action cards apiladas
   - Color cards en columna única
   - Texto legible
   - Touch targets grandes
```

### Mobile Standard (380px - 767px)

**Dispositivos**: iPhone 12, Pixel 5

```
1. Seleccionar iPhone 12 Pro
2. Verificar que:
   - Stats en 3 columnas
   - Action cards en 2 columnas
   - Layout cómodo
   - Scroll mínimo necesario
```

### Tablet (768px - 1023px)

**Dispositivos**: iPad

```
1. Seleccionar iPad Air
2. Verificar que:
   - Score hero horizontal
   - Color cards en 2 columnas
   - Más espacio utilizado
```

### Desktop (1024px+)

**Dispositivos**: Desktop

```
1. Maximizar ventana
2. Verificar que:
   - Color cards en 3 columnas
   - Hover effects funcionan
   - Layout optimizado
```

---

## 🐛 Bugs Comunes a Verificar

### UI Bugs

- [ ] ¿Hay texto truncado?
- [ ] ¿Hay overflow horizontal?
- [ ] ¿Elementos se superponen?
- [ ] ¿Colores incorrectos?
- [ ] ¿Spacing inconsistente?

### Functional Bugs

- [ ] ¿Copiar falla?
- [ ] ¿Color picker no abre?
- [ ] ¿Restaurar no funciona?
- [ ] ¿Filtros no filtran?
- [ ] ¿Notificaciones no aparecen?

### Performance Bugs

- [ ] ¿Animaciones stuttering?
- [ ] ¿Scroll no suave?
- [ ] ¿Load time lento?
- [ ] ¿Memoria leak?

---

## 🔍 Herramientas de Testing

### Chrome DevTools

**Performance Tab**
```
1. F12 → Performance
2. Click Record
3. Interactuar con la app
4. Stop recording
5. Analizar timeline
```

**Lighthouse**
```
1. F12 → Lighthouse
2. Select "Mobile" o "Desktop"
3. Generate report
4. Verificar scores:
   - Performance > 90
   - Accessibility > 95
   - Best Practices > 95
```

**Responsive Design Mode**
```
1. Ctrl+Shift+M (Windows) / Cmd+Shift+M (Mac)
2. Probar diferentes tamaños
3. Verificar breakpoints
```

### Firefox Developer Tools

**Responsive Design Mode**
```
1. Ctrl+Shift+M (Windows) / Cmd+Option+M (Mac)
2. Seleccionar dispositivos
3. Probar orientaciones
```

### Safari Developer Tools (Mac/iOS)

**Responsive Mode**
```
1. Develop → Enter Responsive Design Mode
2. Seleccionar dispositivos iOS
3. Probar en simulador
```

---

## 📊 Métricas de Éxito

### Performance

- ✅ **First Contentful Paint**: < 1.5s
- ✅ **Time to Interactive**: < 3s
- ✅ **Cumulative Layout Shift**: < 0.1
- ✅ **Largest Contentful Paint**: < 2.5s

### Accesibilidad

- ✅ **Lighthouse Accessibility**: > 95
- ✅ **Contrast Ratio**: ≥ 4.5:1 para texto
- ✅ **Keyboard Navigation**: 100% funcional
- ✅ **Screen Reader**: Compatible

### User Experience

- ✅ **Touch Targets**: ≥ 44x44px
- ✅ **Font Size**: ≥ 16px (body)
- ✅ **Loading States**: Visible
- ✅ **Error Handling**: Graceful

---

## 🎬 Video de Testing

### Grabar Session (Opcional)

Si encuentras bugs, graba tu sesión:

**Windows**:
```
Win + G → Capturar
```

**Mac**:
```
Cmd + Shift + 5 → Grabar pantalla
```

**Chrome Extension**: Loom, Awesome Screenshot

---

## 📝 Reportar Bugs

Si encuentras bugs, documenta:

### Información Requerida

```markdown
**Bug**: [Descripción corta]

**Pasos para Reproducir**:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Comportamiento Esperado**:
[Qué debería pasar]

**Comportamiento Actual**:
[Qué está pasando]

**Dispositivo/Browser**:
- Dispositivo: [iPhone 12, Desktop, etc]
- Browser: [Chrome 120, Safari 17, etc]
- OS: [iOS 17, Windows 11, etc]
- Viewport: [375x667]

**Screenshots/Video**:
[Adjuntar si es posible]

**Console Errors**:
```
[Copiar errores de console si hay]
```

**Severidad**:
- [ ] Crítico (rompe funcionalidad)
- [ ] Alto (afecta UX significativamente)
- [ ] Medio (problema menor)
- [ ] Bajo (cosmético)
```

---

## ✅ Checklist Final

Antes de marcar como "Listo para Producción":

- [ ] Probado en 3+ dispositivos mobile diferentes
- [ ] Probado en 2+ navegadores diferentes
- [ ] Lighthouse score > 90 en todas las categorías
- [ ] Sin errores en console
- [ ] Sin warnings de Vue
- [ ] Performance aceptable (60 FPS)
- [ ] Accesibilidad validada
- [ ] Responsive en todos los breakpoints
- [ ] Touch targets apropiados
- [ ] Copy to clipboard funciona
- [ ] Notificaciones funcionan
- [ ] Animaciones suaves
- [ ] Edge cases cubiertos

---

## 🚀 Deploy a Producción

Una vez que todos los tests pasen:

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Deploy (según tu plataforma)
# Vercel
vercel

# Netlify
netlify deploy --prod

# Manual
# Subir carpeta dist/ a tu servidor
```

---

## 💡 Tips de Testing

1. **Prueba Mobile First**: Siempre empieza por mobile
2. **Usa Dispositivos Reales**: DevTools es bueno, pero no perfecto
3. **Prueba Orientaciones**: Portrait y landscape
4. **Prueba Condiciones Reales**: WiFi lenta, CPU throttling
5. **Prueba Accesibilidad**: Keyboard navigation, screen reader
6. **Documenta Bien**: Screenshots y videos ayudan mucho
7. **Prueba Edge Cases**: Valores extremos, errores, estados vacíos

---

¡Feliz Testing! 🧪✨

Si todo funciona correctamente, ¡celebra! 🎉 Has completado un rediseño mobile-first exitoso.


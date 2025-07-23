# 🎨 Poké Palette Analyzer - Estructura de Componentes

## 📁 Estructura Modular

```
src/
├── components/
│   ├── PokemonPaletteAnalyzer.vue    # Componente principal
│   ├── PokemonSearch.vue             # Búsqueda y resultados
│   ├── PokemonCard.vue               # Tarjeta del Pokémon
│   ├── TypeBadge.vue                 # Badges de tipos
│   ├── ColorPalette.vue              # Paleta de colores
│   └── ExportSection.vue             # Exportación
├── services/
│   └── pokeApi.js                    # API de Pokémon
├── utils/
│   └── formatters.js                 # Funciones de formateo
├── styles/
│   └── components.css                # Estilos reutilizables
└── style.css                         # Estilos globales
```

## 🔧 Componentes

### `PokemonPaletteAnalyzer.vue` (Principal)
- **Responsabilidad**: Coordinación general y lógica de theme
- **Props**: Ninguna
- **Emits**: Ninguno
- **Funciones principales**:
  - Búsqueda directa de Pokémon (sin pantalla de selección)
  - Aplicación de themes dinámicos
  - Análisis de colores de imágenes de Pokémon

### `PokemonSearch.vue`
- **Responsabilidad**: Búsqueda de Pokémon y resultados
- **Props**: `isShiny` (Boolean)
- **Emits**: `select-pokemon`, `update-shiny`
- **Funciones principales**:
  - Búsqueda en tiempo real
  - Toggle de shiny
  - Lista de resultados con animaciones

### `PokemonCard.vue`
- **Responsabilidad**: Visualización detallada del Pokémon
- **Props**: `pokemon` (Object), `isShiny` (Boolean)
- **Emits**: `analyze`
- **Funciones principales**:
  - Información física del Pokémon
  - Descripción y evolución
  - Botón de análisis

### `TypeBadge.vue`
- **Responsabilidad**: Badges de tipos con gradientes
- **Props**: `type` (String)
- **Emits**: Ninguno
- **Funciones principales**:
  - Colores dinámicos por tipo
  - Efectos hover con animaciones
  - Traducción de nombres

### `ColorPalette.vue`
- **Responsabilidad**: Visualización de paleta y botones de theme
- **Props**: `palette` (Array), `pokemonName` (String)
- **Emits**: `apply-theme`, `restore-theme`
- **Funciones principales**:
  - Grid de colores clickeables
  - Botones de aplicación de theme
  - Copia de colores al portapapeles

### `ExportSection.vue`
- **Responsabilidad**: Exportación en múltiples formatos
- **Props**: `palette` (Array), `pokemon` (Object), `isShiny` (Boolean)
- **Emits**: Ninguno
- **Funciones principales**:
  - Exportación a CSS, Tailwind, Figma, JSON
  - Generación de código
  - Copia al portapapeles

## 🛠️ Utilidades

### `utils/formatters.js`
Funciones reutilizables para formateo:
- `formatPokemonName()` - Capitalización de nombres
- `formatColorName()` - Traducción de colores
- `formatShapeName()` - Traducción de formas
- `formatEggGroupName()` - Traducción de grupos de huevos
- `getSpanishDescription()` - Descripción en español
- `extractIdFromUrl()` - Extracción de ID de URL

## 🎨 Estilos

### `styles/components.css`
Estilos reutilizables:
- `.btn` - Botones base
- `.input` - Inputs estilizados
- `.card` - Contenedores tipo tarjeta
- `.badge` - Badges con efectos
- `.spinner` - Loading spinner
- Animaciones y responsive

## 🔄 Flujo de Datos

```
PokemonSearch → PokemonCard → ColorPalette → ExportSection
     ↓              ↓              ↓              ↓
  selectPokemon  analyzePokemon  applyTheme   exportCode
```

## 🎯 Beneficios de la Modularización

1. **Mantenibilidad**: Cada componente tiene una responsabilidad específica
2. **Reutilización**: Componentes como `TypeBadge` se pueden usar en otros lugares
3. **Testabilidad**: Componentes más pequeños son más fáciles de testear
4. **Legibilidad**: Código más organizado y fácil de entender
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades

## 🚀 Uso

```vue
<template>
  <PokemonPaletteAnalyzer />
</template>

<script setup>
import PokemonPaletteAnalyzer from './components/PokemonPaletteAnalyzer.vue'
</script>
```

## 📝 Notas de Desarrollo

- Los estilos usan variables CSS para themes dinámicos
- Las animaciones son suaves y consistentes
- El diseño es responsive y accesible
- La fuente Fredoka da un toque Pokémon al diseño 
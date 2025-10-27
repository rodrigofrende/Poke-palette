# Servicio de PokeAPI

Este servicio proporciona una interfaz completa para interactuar con la [PokeAPI](https://pokeapi.co/), permitiendo obtener información de Pokémon, tipos, especies y más.

## Funciones Disponibles

### `getPokemonList(limit = 151, offset = 0)`
Obtiene una lista paginada de Pokémon.

**Parámetros:**
- `limit` (number): Número de Pokémon a obtener (por defecto 151)
- `offset` (number): Número de Pokémon a saltar (por defecto 0)

**Retorna:** Promise con la lista de Pokémon

**Ejemplo:**
```javascript
import { getPokemonList } from './services/pokeApi.js'

// Obtener los primeros 20 Pokémon
const pokemon = await getPokemonList(20, 0)
```

### `getPokemonDetails(identifier)`
Obtiene los detalles completos de un Pokémon específico.

**Parámetros:**
- `identifier` (string|number): ID o nombre del Pokémon

**Retorna:** Promise con los detalles del Pokémon

**Ejemplo:**
```javascript
import { getPokemonDetails } from './services/pokeApi.js'

// Obtener detalles de Pikachu
const pikachu = await getPokemonDetails('pikachu')
// O por ID
const charizard = await getPokemonDetails(6)
```

### `getPokemonSpecies(identifier)`
Obtiene información de la especie de un Pokémon.

**Parámetros:**
- `identifier` (string|number): ID o nombre del Pokémon

**Retorna:** Promise con la información de la especie

### `getPokemonType(identifier)`
Obtiene información de un tipo específico de Pokémon.

**Parámetros:**
- `identifier` (string|number): ID o nombre del tipo

**Retorna:** Promise con la información del tipo

### `getPokemonTypes()`
Obtiene una lista de todos los tipos de Pokémon disponibles.

**Retorna:** Promise con la lista de tipos

### `getPokemonCompleteInfo(identifier)`
Obtiene información completa de un Pokémon incluyendo detalles y especie.

**Parámetros:**
- `identifier` (string|number): ID o nombre del Pokémon

**Retorna:** Promise con objeto que incluye:
- `details`: Detalles del Pokémon
- `species`: Información de la especie
- `imageUrl`: URL de la imagen oficial
- `spriteUrl`: URL del sprite

### Funciones Auxiliares

#### `getPokemonImageUrl(id)`
Genera la URL de la imagen oficial de un Pokémon.

#### `getPokemonSpriteUrl(id)`
Genera la URL del sprite de un Pokémon.

## Uso en Componentes Vue

```vue
<template>
  <div>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="pokemon in pokemonList" :key="pokemon.name">
        <img :src="getPokemonImageUrl(pokemon.id)" :alt="pokemon.name" />
        <h3>{{ pokemon.name }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPokemonList, getPokemonImageUrl } from './services/pokeApi.js'

const pokemonList = ref([])
const loading = ref(false)
const error = ref(null)

const loadPokemon = async () => {
  loading.value = true
  try {
    const data = await getPokemonList(20)
    pokemonList.value = data.results
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPokemon()
})
</script>
```

## Manejo de Errores

El servicio incluye manejo de errores robusto. Todas las funciones lanzan errores que puedes capturar:

```javascript
try {
  const pokemon = await getPokemonDetails('pikachu')
  console.log(pokemon)
} catch (error) {
  console.error('Error al obtener Pokémon:', error.message)
}
```

## URLs de Imágenes

El servicio proporciona URLs para imágenes oficiales y sprites:

- **Imágenes oficiales:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- **Sprites:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`

## Limitaciones de la API

- La PokeAPI tiene límites de rate limiting
- Algunos Pokémon pueden no tener imágenes oficiales disponibles
- La API puede tener tiempos de respuesta variables

## Ejemplos de Respuesta

### Lista de Pokémon
```json
{
  "count": 1281,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  "previous": null,
  "results": [
    {
      "name": "bulbasaur",
      "url": "https://pokeapi.co/api/v2/pokemon/1/"
    }
  ]
}
```

### Detalles de Pokémon
```json
{
  "id": 1,
  "name": "bulbasaur",
  "height": 7,
  "weight": 69,
  "types": [
    {
      "slot": 1,
      "type": {
        "name": "grass",
        "url": "https://pokeapi.co/api/v2/type/12/"
      }
    }
  ],
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  }
}
``` 
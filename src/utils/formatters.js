// Funciones de formateo para nombres y datos de Pokémon

export const formatPokemonName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export const formatColorName = (colorName) => {
  const colorNames = {
    'red': 'Rojo',
    'blue': 'Azul',
    'yellow': 'Amarillo',
    'green': 'Verde',
    'black': 'Negro',
    'brown': 'Marrón',
    'purple': 'Púrpura',
    'gray': 'Gris',
    'white': 'Blanco',
    'pink': 'Rosa'
  }
  return colorNames[colorName] || colorName
}

export const formatShapeName = (shapeName) => {
  const shapeNames = {
    'ball': 'Esférico',
    'squiggle': 'Serpenteante',
    'fish': 'Pez',
    'arms': 'Brazos',
    'blob': 'Amorfo',
    'upright': 'Erguido',
    'legs': 'Patas',
    'quadruped': 'Cuadrúpedo',
    'wings': 'Alas',
    'tentacles': 'Tentáculos',
    'heads': 'Cabezas',
    'humanoid': 'Humanoide',
    'bug-wings': 'Alas de insecto',
    'armor': 'Armadura'
  }
  return shapeNames[shapeName] || shapeName
}

export const formatEggGroupName = (eggGroupName) => {
  const eggGroupNames = {
    'monster': 'Monstruo',
    'water1': 'Agua 1',
    'bug': 'Bicho',
    'flying': 'Volador',
    'ground': 'Tierra',
    'fairy': 'Hada',
    'plant': 'Planta',
    'humanshape': 'Forma humana',
    'water3': 'Agua 3',
    'mineral': 'Mineral',
    'indeterminate': 'Indeterminado',
    'water2': 'Agua 2',
    'ditto': 'Ditto',
    'dragon': 'Dragón',
    'no-eggs': 'Sin huevos'
  }
  return eggGroupNames[eggGroupName] || eggGroupName
}

export const getSpanishDescription = (flavorTextEntries) => {
  const spanishEntry = flavorTextEntries.find(entry => 
    entry.language.name === 'es'
  )
  
  if (spanishEntry) {
    return spanishEntry.flavor_text.replace(/\f|\n|\r/g, ' ')
  }
  
  const englishEntry = flavorTextEntries.find(entry => 
    entry.language.name === 'en'
  )
  
  if (englishEntry) {
    return englishEntry.flavor_text.replace(/\f|\n|\r/g, ' ')
  }
  
  return 'Descripción no disponible'
}

export const extractIdFromUrl = (url) => {
  const match = url.match(/\/(\d+)\/$/)
  return match ? parseInt(match[1]) : null
} 
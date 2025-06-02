<template>
  <BaseLetter
    :character="character"
    :x="glyph.BoundsInTexture.X"
    :y="glyph.BoundsInTexture.Y"
    :width="glyph.BoundsInTexture.Width"
    :height="glyph.BoundsInTexture.Height"
    :verticalOffset="glyph.Cropping.Y"
  />
</template>

<script>
import SmallFont from '@/assets/SmallFont.json'

export default {
  name: 'Letter',
  props: {
    character: String
  },
  computed: {
    glyph() {
      return SmallFont.Glyphs[this.character] || SmallFont.Glyphs[' ']
    }
  }
}
</script>

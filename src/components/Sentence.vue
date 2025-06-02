<template>
  <BaseSentence>
    <Letter v-for="(char, index) in text" :key="index" :character="char" />
  </BaseSentence>
</template>

<script>
export default {
  name: 'Sentence',
  props: {
    text: String
  }
}
</script>

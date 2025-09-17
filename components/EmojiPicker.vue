<template>
  <div class="emoji-picker-container">
    <div class="emoji-picker" @click.stop>
      <div class="emoji-header">
        <div class="emoji-search">
          <b-form-input
            v-model="searchQuery"
            size="sm"
            placeholder="ค้นหา emoji..."
            class="search-input"
          />
        </div>
        <div class="emoji-categories">
          <button
            v-for="category in categories"
            :key="category.key"
            :class="['category-btn', { active: activeCategory === category.key }]"
            :title="category.name"
            @click="activeCategory = category.key"
          >
            {{ category.icon }}
          </button>
        </div>
      </div>

      <div class="emoji-grid" @scroll="handleScroll">
        <div v-if="!searchQuery && recentEmojis.length && activeCategory === 'recent'" class="emoji-section">
          <div class="section-title">
            ใช้ล่าสุด
          </div>
          <div class="emoji-list">
            <button
              v-for="emoji in recentEmojis"
              :key="`recent-${emoji}`"
              class="emoji-btn"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <div v-if="filteredEmojis.length" class="emoji-section">
          <div v-if="searchQuery" class="section-title">
            ผลการค้นหา
          </div>
          <div class="emoji-list">
            <button
              v-for="emoji in displayedEmojis"
              :key="emoji.emoji"
              class="emoji-btn"
              :title="emoji.name"
              @click="selectEmoji(emoji.emoji)"
            >
              {{ emoji.emoji }}
            </button>
          </div>

          <div v-if="hasMore" ref="loadMore" class="load-more">
            <div class="text-center py-2">
              <small class="text-muted">เลื่อนลงเพื่อดูเพิ่มเติม</small>
            </div>
          </div>
        </div>

        <div v-if="searchQuery && !filteredEmojis.length" class="no-results">
          <div class="text-center py-4">
            <div class="mb-2">
              🤔
            </div>
            <small class="text-muted">ไม่พบ emoji ที่ตรงกับการค้นหา</small>
          </div>
        </div>
      </div>

      <div v-if="showSkinTones" class="skin-tone-selector">
        <div class="skin-tone-title">
          เลือกโทนสีผิว:
        </div>
        <div class="skin-tone-options">
          <button
            v-for="(tone, index) in skinTones"
            :key="index"
            class="skin-tone-btn"
            :class="{ active: selectedSkinTone === index }"
            @click="selectedSkinTone = index"
          >
            {{ tone }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmojiPicker',
  data () {
    return {
      searchQuery: '',
      activeCategory: 'people',
      selectedSkinTone: 0,
      showSkinTones: false,
      displayLimit: 48,
      loadIncrement: 24,

      categories: [
        { key: 'recent', name: 'ใช้ล่าสุด', icon: '🕒' },
        { key: 'people', name: 'คนและหน้า', icon: '😀' },
        { key: 'nature', name: 'สัตว์และธรรมชาติ', icon: '🌿' },
        { key: 'food', name: 'อาหารและเครื่องดื่ม', icon: '🍕' },
        { key: 'activity', name: 'กิจกรรม', icon: '⚽' },
        { key: 'travel', name: 'การท่องเที่ยว', icon: '🚗' },
        { key: 'objects', name: 'วัตถุ', icon: '💡' },
        { key: 'symbols', name: 'สัญลักษณ์', icon: '❤️' },
        { key: 'flags', name: 'ธง', icon: '🏁' }
      ],

      skinTones: ['👋', '👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'],

      emojis: {
        people: [
          { emoji: '😀', name: 'grinning face', keywords: ['happy', 'smile', 'ยิ้ม', 'มีความสุข'] },
          { emoji: '😃', name: 'grinning face with big eyes', keywords: ['happy', 'smile', 'ยิ้ม'] },
          { emoji: '😄', name: 'grinning face with smiling eyes', keywords: ['happy', 'smile', 'ยิ้ม'] },
          { emoji: '😁', name: 'beaming face with smiling eyes', keywords: ['happy', 'smile', 'ยิ้ม'] },
          { emoji: '😆', name: 'grinning squinting face', keywords: ['laugh', 'หัวเราะ'] },
          { emoji: '😅', name: 'grinning face with sweat', keywords: ['laugh', 'nervous', 'หัวเราะ'] },
          { emoji: '🤣', name: 'rolling on the floor laughing', keywords: ['laugh', 'หัวเราะ'] },
          { emoji: '😂', name: 'face with tears of joy', keywords: ['laugh', 'cry', 'หัวเราะ'] },
          { emoji: '🙂', name: 'slightly smiling face', keywords: ['smile', 'ยิ้ม'] },
          { emoji: '🙃', name: 'upside-down face', keywords: ['silly', 'ตลก'] },
          { emoji: '😉', name: 'winking face', keywords: ['wink', 'ขยิบตา'] },
          { emoji: '😊', name: 'smiling face with smiling eyes', keywords: ['happy', 'ยิ้ม'] },
          { emoji: '😇', name: 'smiling face with halo', keywords: ['angel', 'นางฟ้า'] },
          { emoji: '🥰', name: 'smiling face with hearts', keywords: ['love', 'รัก'] },
          { emoji: '😍', name: 'smiling face with heart-eyes', keywords: ['love', 'รัก'] },
          { emoji: '🤩', name: 'star-struck', keywords: ['amazing', 'ตื่นตาตื่นใจ'] },
          { emoji: '😘', name: 'face blowing a kiss', keywords: ['kiss', 'จูบ'] },
          { emoji: '😗', name: 'kissing face', keywords: ['kiss', 'จูบ'] },
          { emoji: '☺️', name: 'smiling face', keywords: ['smile', 'ยิ้ม'] },
          { emoji: '😚', name: 'kissing face with closed eyes', keywords: ['kiss', 'จูบ'] },
          { emoji: '😙', name: 'kissing face with smiling eyes', keywords: ['kiss', 'จูบ'] },
          { emoji: '😋', name: 'face savoring food', keywords: ['yummy', 'อร่อย'] },
          { emoji: '😛', name: 'face with tongue', keywords: ['tongue', 'ลิ้น'] },
          { emoji: '😜', name: 'winking face with tongue', keywords: ['tongue', 'wink', 'ลิ้น'] },
          { emoji: '🤪', name: 'zany face', keywords: ['crazy', 'บ้า'] },
          { emoji: '😝', name: 'squinting face with tongue', keywords: ['tongue', 'ลิ้น'] },
          { emoji: '🤑', name: 'money-mouth face', keywords: ['money', 'เงิน'] },
          { emoji: '🤗', name: 'hugging face', keywords: ['hug', 'กอด'] },
          { emoji: '🤭', name: 'face with hand over mouth', keywords: ['oops', 'โอ๊ะ'] },
          { emoji: '🤫', name: 'shushing face', keywords: ['quiet', 'เงียบ'] },
          { emoji: '🤔', name: 'thinking face', keywords: ['thinking', 'คิด'] },
          { emoji: '🤐', name: 'zipper-mouth face', keywords: ['quiet', 'เงียบ'] },
          { emoji: '🤨', name: 'face with raised eyebrow', keywords: ['suspicious', 'สงสัย'] },
          { emoji: '😐', name: 'neutral face', keywords: ['neutral', 'เฉยๆ'] },
          { emoji: '😑', name: 'expressionless face', keywords: ['blank', 'ไม่มีอารมณ์'] },
          { emoji: '😶', name: 'face without mouth', keywords: ['silent', 'เงียบ'] },
          { emoji: '😏', name: 'smirking face', keywords: ['smirk', 'ยิ้มเยาะ'] },
          { emoji: '😒', name: 'unamused face', keywords: ['annoyed', 'รำคาญ'] },
          { emoji: '🙄', name: 'face with rolling eyes', keywords: ['annoyed', 'รำคาญ'] },
          { emoji: '😬', name: 'grimacing face', keywords: ['awkward', 'อึดอัด'] },
          { emoji: '🤥', name: 'lying face', keywords: ['lie', 'โกหก'] },
          { emoji: '😔', name: 'pensive face', keywords: ['sad', 'เศร้า'] },
          { emoji: '😪', name: 'sleepy face', keywords: ['sleepy', 'ง่วง'] },
          { emoji: '🤤', name: 'drooling face', keywords: ['drool', 'น้ำลาย'] },
          { emoji: '😴', name: 'sleeping face', keywords: ['sleep', 'นอน'] }
        ],
        nature: [
          { emoji: '🐶', name: 'dog face', keywords: ['dog', 'หมา'] },
          { emoji: '🐱', name: 'cat face', keywords: ['cat', 'แมว'] },
          { emoji: '🐭', name: 'mouse face', keywords: ['mouse', 'หนู'] },
          { emoji: '🐹', name: 'hamster', keywords: ['hamster', 'แฮมสเตอร์'] },
          { emoji: '🐰', name: 'rabbit face', keywords: ['rabbit', 'กระต่าย'] },
          { emoji: '🦊', name: 'fox', keywords: ['fox', 'จิ้งจอก'] },
          { emoji: '🐻', name: 'bear', keywords: ['bear', 'หมี'] },
          { emoji: '🐼', name: 'panda', keywords: ['panda', 'แพนด้า'] },
          { emoji: '🐨', name: 'koala', keywords: ['koala', 'โคอาล่า'] },
          { emoji: '🐯', name: 'tiger face', keywords: ['tiger', 'เสือ'] },
          { emoji: '🦁', name: 'lion', keywords: ['lion', 'สิงโต'] },
          { emoji: '🐮', name: 'cow face', keywords: ['cow', 'วัว'] },
          { emoji: '🐷', name: 'pig face', keywords: ['pig', 'หมู'] },
          { emoji: '🐽', name: 'pig nose', keywords: ['pig', 'หมู'] },
          { emoji: '🐸', name: 'frog', keywords: ['frog', 'กบ'] },
          { emoji: '🐵', name: 'monkey face', keywords: ['monkey', 'ลิง'] },
          { emoji: '🙈', name: 'see-no-evil monkey', keywords: ['monkey', 'ลิง'] },
          { emoji: '🙉', name: 'hear-no-evil monkey', keywords: ['monkey', 'ลิง'] },
          { emoji: '🙊', name: 'speak-no-evil monkey', keywords: ['monkey', 'ลิง'] }
        ],
        food: [
          { emoji: '🍎', name: 'red apple', keywords: ['apple', 'แอปเปิ้ล'] },
          { emoji: '🍊', name: 'orange', keywords: ['orange', 'ส้ม'] },
          { emoji: '🍋', name: 'lemon', keywords: ['lemon', 'มะนาว'] },
          { emoji: '🍌', name: 'banana', keywords: ['banana', 'กล้วย'] },
          { emoji: '🍉', name: 'watermelon', keywords: ['watermelon', 'แตงโม'] },
          { emoji: '🍇', name: 'grapes', keywords: ['grapes', 'องุ่น'] },
          { emoji: '🍓', name: 'strawberry', keywords: ['strawberry', 'สตรอเบอรี่'] },
          { emoji: '🍈', name: 'melon', keywords: ['melon', 'เมล่อน'] },
          { emoji: '🍒', name: 'cherries', keywords: ['cherry', 'เชอร์รี่'] },
          { emoji: '🍑', name: 'peach', keywords: ['peach', 'ลูกพีช'] },
          { emoji: '🥭', name: 'mango', keywords: ['mango', 'มะม่วง'] },
          { emoji: '🍍', name: 'pineapple', keywords: ['pineapple', 'สับปะรด'] },
          { emoji: '🥥', name: 'coconut', keywords: ['coconut', 'มะพร้าว'] },
          { emoji: '🥝', name: 'kiwi fruit', keywords: ['kiwi', 'กีวี่'] },
          { emoji: '🍅', name: 'tomato', keywords: ['tomato', 'มะเขือเทศ'] }
        ],
        activity: [],
        travel: [],
        objects: [],
        symbols: [],
        flags: []
      }
    }
  },
  computed: {
    recentEmojis () {
      const recent = JSON.parse(localStorage.getItem('recent-emojis') || '[]')
      return recent.slice(0, 24)
    },

    currentEmojis () {
      if (this.searchQuery) {
        return this.searchEmojis()
      }
      return this.emojis[this.activeCategory] || []
    },

    filteredEmojis () {
      return this.currentEmojis
    },

    displayedEmojis () {
      return this.filteredEmojis.slice(0, this.displayLimit)
    },

    hasMore () {
      return this.filteredEmojis.length > this.displayLimit
    }
  },
  mounted () {
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    searchEmojis () {
      const query = this.searchQuery.toLowerCase().trim()
      if (!query) { return [] }

      const allEmojis = Object.values(this.emojis).flat()
      return allEmojis.filter((emoji) => {
        return emoji.name.toLowerCase().includes(query) ||
               emoji.keywords.some(keyword => keyword.toLowerCase().includes(query))
      })
    },

    selectEmoji (emoji) {
      this.addToRecent(emoji)
      this.$emit('emoji-selected', emoji)
    },

    addToRecent (emoji) {
      let recent = JSON.parse(localStorage.getItem('recent-emojis') || '[]')

      recent = recent.filter(e => e !== emoji)

      recent.unshift(emoji)

      recent = recent.slice(0, 24)

      localStorage.setItem('recent-emojis', JSON.stringify(recent))
    },

    handleScroll (event) {
      const { scrollTop, scrollHeight, clientHeight } = event.target

      if (scrollTop + clientHeight >= scrollHeight - 50 && this.hasMore) {
        this.displayLimit += this.loadIncrement
      }
    },

    handleOutsideClick () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.emoji-picker-container {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
  margin-bottom: 8px;
}

.emoji-picker {
  width: 320px;
  height: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.emoji-header {
  border-bottom: 1px solid #e9ecef;
  padding: 12px;
}

.emoji-search {
  margin-bottom: 8px;
}

.search-input {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.emoji-categories {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.category-btn {
  background: none;
  border: none;
  border-radius: 6px;
  padding: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.category-btn:hover {
  background: #f8f9fa;
}

.category-btn.active {
  background: #ffc107;
  transform: scale(1.1);
}

.emoji-grid {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.emoji-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 8px;
  padding: 0 4px;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}

.emoji-btn:hover {
  background: #f8f9fa;
  transform: scale(1.2);
}

.emoji-btn:active {
  transform: scale(1.1);
}

.load-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: 8px;
}

.no-results {
  text-align: center;
  padding: 32px 16px;
  font-size: 1.5rem;
}

.skin-tone-selector {
  border-top: 1px solid #e9ecef;
  padding: 12px;
  background: #f8f9fa;
}

.skin-tone-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 8px;
}

.skin-tone-options {
  display: flex;
  gap: 4px;
}

.skin-tone-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skin-tone-btn:hover {
  border-color: #dee2e6;
}

.skin-tone-btn.active {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .emoji-picker {
    width: 280px;
    height: 250px;
  }

  .emoji-list {
    grid-template-columns: repeat(7, 1fr);
  }

  .emoji-btn {
    font-size: 1rem;
    padding: 6px;
  }
}
</style>

// components/EmojiPicker.vue
<template>
  <div class="modern-emoji-picker" :data-theme="chatTheme">
    <div class="picker-header">
      <span class="picker-title">เลือกอิโมจิ</span>
      <button class="close-picker" @click="$emit('close')">
        <i class="fas fa-times" />
      </button>
    </div>
    <div class="emoji-categories">
      <button
        v-for="(category, index) in categories"
        :key="category.id"
        :class="['category-btn', { active: activeCategory === index }]"
        @click="activeCategory = index"
      >
        <span class="category-icon">{{ category.icon }}</span>
      </button>
    </div>

    <div class="emoji-search-wrapper">
      <div class="search-icon">
        <i class="fas fa-search" />
      </div>
      <input
        v-model="searchQuery"
        type="text"
        class="emoji-search-input"
        placeholder="ค้นหาอิโมจิ..."
      >
    </div>

    <div class="emoji-grid-container">
      <div v-if="searchQuery" class="search-results">
        <div class="section-title">
          ผลการค้นหา
        </div>
        <div class="emoji-grid">
          <button
            v-for="emoji in filteredEmojis"
            :key="emoji"
            class="emoji-item"
            @click="handleEmojiClick(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
        <div v-if="filteredEmojis.length === 0" class="no-results">
          <p>ไม่พบอิโมจิ</p>
        </div>
      </div>

      <div v-else>
        <div
          v-for="(category, catIndex) in categories"
          v-show="activeCategory === catIndex"
          :key="category.id"
          class="emoji-section"
        >
          <div class="section-title">
            {{ category.name }}
          </div>
          <div class="emoji-grid">
            <button
              v-for="emoji in category.emojis"
              :key="emoji"
              class="emoji-item"
              @click="handleEmojiClick(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="recentEmojis.length && !searchQuery" class="recent-section">
      <div class="section-title">
        <i class="fas fa-history" />
        <span>ล่าสุด</span>
      </div>
      <div class="emoji-grid">
        <button
          v-for="emoji in recentEmojis"
          :key="emoji"
          class="emoji-item recent"
          @click="handleEmojiClick(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernEmojiPicker',
  props: {
    chatTheme: { type: String, default: 'default' }
  },
  data () {
    return {
      activeCategory: 0,
      searchQuery: '',
      recentEmojis: [],
      categories: [
        {
          id: 'smileys',
          name: 'หน้ายิ้ม',
          icon: '😀',
          emojis: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊']
        },
        {
          id: 'gestures',
          name: 'ท่าทาง',
          icon: '👍',
          emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '🖐', '🤚', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤲', '👐', '🤝', '🙏', '✍️', '💅', '🤳', '💍', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁', '👀', '🧠', '🦴', '🦷']
        },
        {
          id: 'hearts',
          name: 'หัวใจ',
          icon: '❤️',
          emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '💑', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💏', '👩‍❤️‍💋‍👨', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧']
        },
        {
          id: 'animals',
          name: 'สัตว์',
          icon: '🐶',
          emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔']
        },
        {
          id: 'food',
          name: 'อาหาร',
          icon: '🍎',
          emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾']
        },
        {
          id: 'activities',
          name: 'กิจกรรม',
          icon: '⚽',
          emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '⛑', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟', '🎯', '🎳', '🎮', '🎰']
        },
        {
          id: 'travel',
          name: 'เดินทาง',
          icon: '🚗',
          emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓', '🚧', '⛽', '🚏', '🚦', '🚥', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺', '🛖', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩', '🛤', '🛣', '🗾', '🎑', '🏞', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙', '🌃', '🌌', '🌉', '🌁']
        },
        {
          id: 'objects',
          name: 'วัตถุ',
          icon: '💡',
          emojis: ['💡', '🔦', '🏮', '🪔', '📱', '📲', '💻', '🖥', '⌨', '🖱', '🖨', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💶', '💵', '💴', '💷', '💰', '💳', '💎', '⚖', '🪜', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔', '🛡', '🚬', '⚰', '🪦', '⚱', '🏺', '🔮', '📿', '🧿', '💈', '⚗', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪑', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🪥', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂', '🖊', '🖋', '✒', '🖌', '🖍', '📝', '✏', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
        },
        {
          id: 'symbols',
          name: 'สัญลักษณ์',
          icon: '💯',
          emojis: ['💯', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '🔅', '🔆', '〽', '⚠', '🚸', '🔱', '⚜', '🔰', '♻', '✅', '🈯', '💹', '❇', '✳', '❎', '🌐', '💠', 'Ⓜ', '🌀', '💤', '🏧', '🚾', '♿', '🅿', '🛗', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏', '▶', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀', '🔼', '🔽', '➡', '⬅', '🔼', '🔽', '↗', '↘', '↙', '↖', '🔄', '↪', '↩', '🔃', '⤴', '⤵', '🔀', '🔁', '🔂', '🎦', '🔅', '🔆', '🔡', '🔠', '💲', '💱', '™', '©', '®', '👁‍🗨', '🔚', '🔙', '🔛', '🔝', '🔜', '〰', '➰', '➿', '✔', '☑', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪', '▫', '◾', '◽', '◼', '◻', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫']
        },
        {
          id: 'flags',
          name: 'ธง',
          icon: '🏁',
          emojis: ['🏁', '🚩', '🎌', '🏴', '🏳', '🏳‍🌈', '🏴‍☠️', '🇹🇭', '🇺🇸', '🇬🇧', '🇯🇵', '🇰🇷', '🇨🇳', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸']
        }
      ]
    }
  },
  computed: {
    filteredEmojis () {
      if (!this.searchQuery.trim()) {
        return []
      }

      const query = this.searchQuery.toLowerCase()
      const allEmojis = this.categories.flatMap(cat => cat.emojis)

      return allEmojis.filter((emoji) => {
        // Simple search - in real app, would use emoji names/keywords
        return emoji.includes(query) || query.length === 1
      })
    }
  },
  methods: {
    handleEmojiClick (emoji) {
      console.log('🎯 Emoji clicked:', emoji)
      this.$emit('emoji-selected', emoji)
    },
    addRecent (emoji) {
      if (!this.recentEmojis.includes(emoji)) {
        this.recentEmojis.unshift(emoji)
        if (this.recentEmojis.length > 20) {
          this.recentEmojis.pop()
        }
      }
    }
  }
}
</script>

<style scoped>
.modern-emoji-picker {
  --ink: #101014;
  --paper-soft: #1b1b25;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --yellow: #ffc94d;
  --white: #ffffff;
  --line: 3px;
  --line-sm: 2px;
  --shadow-sm: 4px 4px 0 var(--ink);
  --shadow-xs: 2px 2px 0 var(--ink);
  --radius-lg: 20px;
  --radius-md: 12px;
  --radius-pill: 999px;

  position: absolute;
  right: 0;
  bottom: 68px;
  width: 340px;
  max-height: 380px;
  display: flex;
  flex-direction: column;
  background: var(--cream);
  border: var(--line) solid var(--ink);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  z-index: 50;
  overflow: hidden;
  animation: pop-in 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  from { opacity: 0; transform: translateY(10px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--violet);
  border-bottom: var(--line-sm) solid var(--ink);
  flex-shrink: 0;
}

.picker-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--white);
}

.close-picker {
  background: var(--coral);
  border: var(--line-sm) solid var(--ink);
  color: var(--white);
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: transform 0.15s ease;
}

.close-picker:hover {
  transform: rotate(90deg);
}

.emoji-categories {
  display: flex;
  gap: 6px;
  padding: 10px 10px 8px;
  border-bottom: var(--line-sm) solid var(--ink);
  background: var(--yellow);
  overflow-x: auto;
  flex-shrink: 0;
}

.emoji-categories::-webkit-scrollbar { display: none; }

.category-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: var(--line-sm) solid var(--ink);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
}

.category-btn.active {
  background: var(--violet);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xs);
}

.emoji-search-wrapper {
  position: relative;
  padding: 10px;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(16, 16, 20, 0.5);
  font-size: 0.8rem;
}

.emoji-search-input {
  width: 100%;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-pill);
  padding: 7px 12px 7px 32px;
  font-size: 0.82rem;
  color: var(--ink);
}

.emoji-search-input::placeholder { color: rgba(16, 16, 20, 0.4); }
.emoji-search-input:focus { outline: none; border-color: var(--violet); }

.emoji-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 10px;
}

.emoji-grid-container::-webkit-scrollbar { width: 5px; }
.emoji-grid-container::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 3px; }

.section-title {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(16, 16, 20, 0.55);
  margin: 8px 2px 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.emoji-item {
  background: transparent;
  border: none;
  font-size: 1.35rem;
  padding: 5px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.12s ease, transform 0.12s ease;
}

.emoji-item:hover {
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  transform: scale(1.1);
}

.no-results {
  text-align: center;
  padding: 20px 0;
  color: rgba(16, 16, 20, 0.5);
  font-size: 0.85rem;
}

.recent-section {
  border-top: var(--line-sm) dashed var(--ink);
  padding: 4px 10px 10px;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .modern-emoji-picker { width: 280px; }
  .emoji-grid { grid-template-columns: repeat(6, 1fr); }
}
</style>

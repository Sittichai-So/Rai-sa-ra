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

    <div class="emoji-grid-container">
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

    <div v-if="recentEmojis.length" class="recent-section">
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
  mounted () {
    try {
      const saved = JSON.parse(localStorage.getItem('recentEmojis') || '[]')
      if (Array.isArray(saved)) { this.recentEmojis = saved.slice(0, 16) }
    } catch (e) {}
  },
  methods: {
    handleEmojiClick (emoji) {
      this.addRecent(emoji)
      this.$emit('emoji-selected', emoji)
    },
    addRecent (emoji) {
      this.recentEmojis = [emoji, ...this.recentEmojis.filter(e => e !== emoji)].slice(0, 16)
      try {
        localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis))
      } catch (e) {}
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
  right: 16px;
  bottom: calc(100% + 8px);
  width: min(340px, calc(100vw - 32px));
  max-height: min(380px, 60vh);
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
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  border-bottom: var(--line-sm) solid var(--ink);
  flex-shrink: 0;
}

.picker-title {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--white);
}

.close-picker {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid var(--ink);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--white);
  font-size: 0.9rem;
}

.close-picker:hover {
  background: var(--coral);
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--ink);
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
  gap: 8px;
  padding: 12px 12px 10px;
  border-bottom: var(--line-sm) solid var(--ink);
  background: var(--yellow);
  overflow-x: auto;
  flex-shrink: 0;
}

.emoji-categories::-webkit-scrollbar { display: none; }

.category-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--ink);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--ink);
}

.category-btn.active {
  background: var(--violet);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--ink);
}

.emoji-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px 10px;
}

.emoji-grid-container::-webkit-scrollbar { width: 5px; }
.emoji-grid-container::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 3px; }

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink);
  margin: 10px 2px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(124, 111, 245, 0.1);
  border: 1px solid var(--ink);
  border-radius: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
}

.emoji-item {
  background: var(--white);
  border: 2px solid var(--ink);
  font-size: 1.3rem;
  padding: 5px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  line-height: 1;
}

.emoji-item:hover {
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--ink);
  background: var(--yellow);
}

.recent-section {
  border-top: var(--line-sm) dashed var(--ink);
  padding: 4px 10px 10px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .modern-emoji-picker {
    right: 12px;
    left: 12px;
    width: auto;
    max-height: 56vh;
  }
  .emoji-grid { grid-template-columns: repeat(6, 1fr); gap: 5px; }
  .emoji-item { font-size: 1.25rem; padding: 5px; }
  .category-btn { width: 32px; height: 32px; font-size: 1rem; }
}

@media (max-width: 380px) {
  .emoji-grid { grid-template-columns: repeat(5, 1fr); }
}
</style>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
      <b-container>
        <b-navbar-brand href="#" class="navbar-brand-custom">
          <b-img src="@/assets/images/2.png" fluid alt="Responsive image" width="80%" />
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav class="w-100">
          <div class="d-flex justify-content-center flex-grow-1">
            <b-navbar-nav
              class="nav-center"
            >
              <b-nav-item class="nav-item-custom" @click="scrollToSection('hero')">
                <i class="fas fa-home mr-1" />หน้าแรก
              </b-nav-item>
              <b-nav-item class="nav-item-custom" @click="scrollToSection('features')">
                <i class="fas fa-star mr-1" />คุณสมบัติ
              </b-nav-item>
              <b-nav-item class="nav-item-custom" @click="scrollToSection('chat-demo')">
                <i class="fas fa-comments mr-1" />ตัวอย่างแชท
              </b-nav-item>
              <b-nav-item class="nav-item-custom" @click="scrollToSection('about')">
                <i class="fa-solid fa-handshake mr-1" />เกี่ยวกับเรา
              </b-nav-item>
              <b-nav-item class="nav-item-custom" @click="scrollToSection('stats')">
                <i class="fas fa-chart-bar mr-1" />สถิติ
              </b-nav-item>
            </b-navbar-nav>
          </div>

          <b-navbar-nav class="ml-auto">
            <template v-if="account">
              <b-nav-item class="nav-item-custom login-btn" @click="enterApp">
                <i class="fa-solid fa-right-to-bracket" /> เข้าแอป · {{ account.name }}
              </b-nav-item>
              <b-nav-item class="nav-item-custom join-btn" @click="signOut">
                <i class="fas fa-right-from-bracket mr-1" />ออกจากระบบ
              </b-nav-item>
            </template>
            <template v-else>
              <b-nav-item class="nav-item-custom login-btn" @click="joinCommunity">
                <i class="fa-solid fa-right-to-bracket" /> Login
              </b-nav-item>
              <b-nav-item class="nav-item-custom join-btn" @click="goRegister">
                <i class="fas fa-user-plus mr-1" />สมัครเข้าร่วมกับเรา
              </b-nav-item>
            </template>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </nav>

    <section id="hero" class="hero-section">
      <div class="bg-shapes">
        <div class="shape" />
        <div class="shape" />
        <div class="shape" />
      </div>
      <b-container class="hero-content">
        <span class="hero-eyebrow">COMMUNITY OS สำหรับคนไทย</span>
        <h1 class="hero-title">
          RAI-SA-RA
        </h1>
        <p class="hero-subtitle">
          Community แชทที่เจ๋งที่สุด
        </p>
        <p class="hero-description">
          พบกับประสบการณ์การสนทนาที่ไม่เหมือนใคร! พูดคุยเรื่องเกม การเมือง กีฬา
          หรือสิ่งที่คุณสนใจกับคนที่มีความคิดเหมือนกันในชุมชนที่เป็นมิตรและสนุกสนาน
        </p>
        <div class="cta-buttons">
          <b-button
            variant="primary"
            size="lg"
            class="btn-primary-custom mr-3 mb-2"
            @click="joinCommunity"
          >
            เข้าร่วมชุมชน
          </b-button>
          <b-button
            variant="outline-light"
            size="lg"
            class="btn-outline-custom mb-2"
            @click="learnMore"
          >
            ดูข้อมูลเพิ่มเติม
          </b-button>
        </div>

        <div class="hero-stat-card">
          <div class="hero-stat-top">
            <span class="hero-stat-badge">
              <span class="live-dot" />ออนไลน์ตอนนี้
            </span>
          </div>
          <div class="hero-stat-value">
            {{ onlineUsers.toLocaleString() }} คน
          </div>
          <div class="hero-stat-label">
            กำลังคุยกันอยู่ในห้องแชทต่างๆ
          </div>
        </div>
      </b-container>
    </section>

    <section id="features" class="features-section">
      <b-container>
        <span class="section-eyebrow">คุณสมบัติ</span>
        <h2 class="section-title">
          ทำไมต้องเลือก RAI-SA-RA?
        </h2>
        <b-row>
          <b-col
            v-for="(feature, index) in features"
            :key="index"
            md="4"
            class="mb-4"
          >
            <b-card
              class="feature-card h-100"
              :class="'tone-' + (index % 4)"
              no-body
            >
              <b-card-body>
                <div class="feature-card-top">
                  <div class="feature-icon">
                    <i :class="feature.icon" />
                  </div>
                </div>
                <b-card-title class="feature-title">
                  {{ feature.title }}
                </b-card-title>
                <b-card-text class="feature-description">
                  {{ feature.description }}
                </b-card-text>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <section id="chat-demo" class="chat-demo">
      <b-container>
        <span class="section-eyebrow section-eyebrow-light">ตัวอย่างการใช้งาน</span>
        <h2 class="section-title text-white">
          ลองดูการสนทนา
        </h2>
        <b-row>
          <b-col md="8" class="mx-auto">
            <div class="chat-window">
              <div class="chat-header">
                <div class="d-flex align-items-center w-100">
                  <span class="hero-stat-badge chat-live-badge">
                    <span class="live-dot" />ห้องแชทเกม
                  </span>
                  <div class="ml-auto chat-users-pill">
                    <i class="fas fa-users mr-1" /> {{ onlineUsers.toLocaleString() }} คน
                  </div>
                </div>
              </div>
              <div ref="chatMessages" class="chat-messages">
                <div
                  v-for="(message, index) in chatMessages"
                  :key="index"
                  class="message"
                  :class="{ 'own': message.isOwn }"
                >
                  <template v-if="!message.isOwn">
                    <strong>{{ message.user }}:</strong>
                  </template>
                  <div class="message-bubble">
                    {{ message.text }}
                  </div>
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <section id="about" class="about-section">
      <b-container>
        <span class="section-eyebrow">เกี่ยวกับเรา</span>
        <h2 class="section-title">
          เกี่ยวกับเรา
        </h2>
        <div class="about-card">
          <p class="about-text">
            <strong>RAI-SA-RA</strong> ถูกสร้างขึ้นเพื่อเชื่อมโยงคนไทยจากทั่วทุกมุมโลก
            เราเชื่อในพลังของการสนทนา การแบ่งปันความรู้ และการสร้างมิตรภาพใหม่ๆ
            ไม่ว่าจะเป็นเรื่องเกม การเรียน กีฬา หรือแม้แต่ชีวิตประจำวัน
          </p>
        </div>
      </b-container>
    </section>

    <section id="testimonials" class="testimonials-section">
      <b-container>
        <span class="section-eyebrow">เสียงจากชุมชน</span>
        <h2 class="section-title">
          เสียงจากชุมชน
        </h2>
        <b-row>
          <b-col v-for="(review, index) in reviews" :key="index" md="4" class="mb-4">
            <b-card class="testimonial-card h-100" :class="'tone-' + (index % 4)">
              <b-card-body>
                <p class="testimonial-text">
                  "{{ review.text }}"
                </p>
                <div class="text-right">
                  <strong>- {{ review.user }}</strong>
                </div>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <section id="stats" class="stats-section">
      <b-container>
        <span class="section-eyebrow section-eyebrow-light">สถิติ</span>
        <h2 class="section-title text-white mb-5">
          RAI-SA-RA เป็นตัวเลข
        </h2>
        <b-row>
          <b-col
            v-for="(stat, index) in stats"
            :key="index"
            md="3"
            class="mb-4"
          >
            <div class="stat-item" :class="'tone-' + (index % 4)">
              <span
                class="stat-number d-block"
                :data-target="stat.value"
              >
                {{ animatedStats[index] }}
              </span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <footer class="footer">
      <b-container>
        <b-row>
          <b-col md="6">
            <b-img src="@/assets/images/2.png" fluid alt="Responsive image" width="100%" />
            <p>ชุมชนแชทที่ดีที่สุดสำหรับคนไทย พร้อมพูดคุยทุกเรื่องที่คุณสนใจ</p>
          </b-col>
          <b-col md="6" class="text-right">
            <h5>ติดตามเรา</h5>
            <div class="social-links">
              <b-link
                v-for="(social, index) in socialLinks"
                :key="index"
                :href="social.url"
                target="_blank"
              >
                <i :class="social.icon" />
              </b-link>
            </div>
          </b-col>
        </b-row>
        <hr style="border-color: #33333f; margin: 30px 0;">
        <div class="text-center">
          <p>&copy; 2025 RAI-SA-RA Community. สงวนลิขสิทธิ์.</p>
        </div>
      </b-container>
    </footer>

    <b-modal
      id="info-modal"
      title="ข้อมูลเพิ่มเติม"
      size="xl"
      centered
      hide-footer
      modal-class="custom-modal"
      header-class="custom-modal-header"
      body-class="custom-modal-body"
    >
      <b-tabs content-class="mt-3">
        <b-tab title="✨ คุณสมบัติ" active>
          <h5 class="highlight-sub">
            คุณสมบัติเด่นของ RAI-SA-RA
          </h5>
          <ul class="styled-list">
            <li>
              ⚡ แชทแบบเรียลไทม์ไม่มีดีเลย์
            </li>
            <li>
              📂 ห้องแชทแยกตามหมวดหมู่
            </li>
            <li>
              🔒 ระบบรักษาความปลอดภัยสูง
            </li>
            <li>
              🎨 Interface ใช้งานง่าย
            </li>
            <li>
              📱 Support ทั้ง Desktop และ Mobile
            </li>
          </ul>
        </b-tab>
        <b-tab title="💬 ห้องแชท">
          <h5 class="highlight-sub">
            ห้องแชทยอดนิยม
          </h5>
          <b-list-group>
            <b-list-group-item
              v-for="room in chatRooms"
              :key="room.name"
              class="chat-room-item"
            >
              <div class="d-flex justify-content-between">
                <strong>{{ room.name }}</strong>
                <b-badge variant="light" class="user-badge">
                  👥 {{ room.users }} คน
                </b-badge>
              </div>
              <small class="text-muted">{{ room.description }}</small>
            </b-list-group-item>
          </b-list-group>
        </b-tab>
        <b-tab title="📜 กฎระเบียบ">
          <h5 class="highlight-sub">
            กฎของชุมชน
          </h5>
          <ol class="styled-ol">
            <li>
              🙏 เคารพสมาชิกคนอื่น
            </li>
            <li>
              🚫 ไม่โพสต์เนื้อหาที่ไม่เหมาะสม
            </li>
            <li>
              💡 ไม่ Spam หรือ Flood ข้อความ
            </li>
            <li>
              🗣 ใช้ภาษาที่สุภาพ
            </li>
            <li>
              🔐 ไม่แชร์ข้อมูลส่วนตัวของคนอื่น
            </li>
          </ol>
        </b-tab>
      </b-tabs>
    </b-modal>
  </div>
</template>

<script>
import { ensureCleanSession, clearAuth } from '~/utils/auth'

export default {
  name: 'RaiSaRaLanding',
  data () {
    return {
      account: null,
      onlineUsers: 1234,
      animatedStats: [0, 0, 0, 0],
      statsAnimated: false,
      chatMessageIndex: 0,
      form: {
        username: '',
        password: ''
      },
      features: [
        {
          icon: 'fas fa-comments',
          title: 'แชทแบบเรียลไทม์',
          description: 'สนทนาแบบเรียลไทม์กับเพื่อนๆ ในชุมชน ไม่มีดีเลย์ ไม่มีรอ ตอบกลับได้ทันที เหมือนพูดคุยแบบเผชิญหน้า'
        },
        {
          icon: 'fas fa-gamepad',
          title: 'ห้องแชทเกม',
          description: 'มีห้องแชทเฉพาะสำหรับเกมเมอร์ พูดคุยเกมโปรด แชร์เทคนิค หาทีมเล่นเกมด้วยกัน ทั้ง PC Mobile และ Console'
        },
        {
          icon: 'fas fa-futbol',
          title: 'พูดคุยกีฬา',
          description: 'ติดตามข่าวกีฬา วิเคราะห์การแข่งขัน แชร์ความคิดเห็น กับแฟนกีฬาคนอื่นๆ ครบทุกกีฬา ทั้งในและต่างประเทศ'
        },
        {
          icon: 'fas fa-vote-yea',
          title: 'ห้องพูดคุยการเมือง',
          description: 'แลกเปลี่ยนความคิดเห็นทางการเมืองอย่างสร้างสรรค์ ในบรรยากาศที่เป็นกันเอง มีกฎระเบียบชัดเจน'
        },
        {
          icon: 'fas fa-shield-alt',
          title: 'ปลอดภัยและเป็นส่วนตัว',
          description: 'ระบบรักษาความปลอดภัยระดับสูง ข้อมูลส่วนตัวได้รับการคุมครอง มีทีมดูแลตลอด 24 ชั่วโมง'
        },
        {
          icon: 'fas fa-users',
          title: 'ชุมชนที่เป็นมิตร',
          description: 'สมาชิกทุกคนเป็นมิตรและช่วยเหลือกัน บรรยากาศดี ไม่มี Toxic ทุกคนสามารถพูดคุยได้อย่างสบายใจ'
        }
      ],
      stats: [
        { value: 15000, label: 'สมาชิกทั้งหมด' },
        { value: 50, label: 'ห้องแชท' },
        { value: 1000000, label: 'ข้อความต่อวัน' },
        { value: 24, label: 'ออนไลน์ 24/7' }
      ],
      socialLinks: [
        { icon: 'fab fa-facebook', url: '#' },
        { icon: 'fab fa-twitter', url: '#' },
        { icon: 'fab fa-discord', url: '#' },
        { icon: 'fab fa-youtube', url: '#' }
      ],
      chatMessages: [
        { user: 'เกมเมอร์โปร', text: 'มีใครเล่น Valorant อยู่บ้างครับ หาทีม Ranked', isOwn: false },
        { user: 'นักสู้อันดับ1', text: 'ผมเล่นอยู่! Rank อะไรครับ?', isOwn: false },
        { text: 'Diamond 2 ครับ หาคนเล่นด้วยกัน 🎮', isOwn: true },
        { user: 'สปอร์ตแฟน', text: 'เปลี่ยนเรื่องหน่อย คืนนี้มีบอลไทยลีกนะครับ!', isOwn: false }
      ],
      newChatMessages: [
        { user: 'การเมืองวิเคราะห์', text: 'เมื่อไหร่จะมีการเลือกตั้ง กันแน่นะครับ', isOwn: false },
        { user: 'ฟุตบอลแฟน', text: 'เชลซีเก่งขึ้นเยอะเลยฤดูกาลนี้!', isOwn: false },
        { user: 'เกมมาสเตอร์', text: 'Genshin Impact อัพเดทใหม่เจ๋งมาก', isOwn: false },
        { user: 'เทคโนโลยี', text: 'AI Chat ตอนนี้พัฒนาไปไกลมาก', isOwn: false }
      ],
      chatRooms: [
        { name: 'ห้องแชทเกม', users: 2341, description: 'พูดคุยเรื่องเกมทุกแนว' },
        { name: 'ห้องแชทกีฬา', users: 1876, description: 'ติดตามข่าวกีฬาและวิเคราะห์' },
        { name: 'ห้องแชทการเมือง', users: 1523, description: 'อภิปรายการเมืองอย่างสร้างสรรค์' },
        { name: 'ห้องแชททั่วไป', users: 3456, description: 'คุยกันแบบสบายๆ' },
        { name: 'ห้องแชทเทคโนโลยี', users: 987, description: 'พูดคุยเรื่องเทคโนโลยีและนวัตกรรม' }
      ],
      reviews: [
        { user: 'นัท', text: 'เป็นชุมชนที่อบอุ่นมาก เจอเพื่อนใหม่เยอะเลย ❤️' },
        { user: 'ฝน', text: 'ชอบที่ระบบใช้ง่าย แถมปลอดภัยด้วยค่ะ 🔒' },
        { user: 'บอล', text: 'ได้แลกเปลี่ยนไอเดียกับคนที่สนใจเหมือนกัน ดีมากๆ 👍' }
      ]
    }
  },
  head () {
    return {
      title: 'RAI-SA-RA - Community แชทที่เจ๋งที่สุด',
      meta: [
        { hid: 'description', name: 'description', content: 'พบกับประสบการณ์การสนทนาที่ไม่เหมือนใคร! พูดคุยเรื่องเกม การเมือง กีฬา กับชุมชน RAI-SA-RA' },
        { property: 'og:title', content: 'RAI-SA-RA - Community แชทที่เจ๋งที่สุด' },
        { property: 'og:description', content: 'ชุมชนแชทที่ดีที่สุดสำหรับคนไทย พร้อมพูดคุยทุกเรื่องที่คุณสนใจ' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },
  mounted () {
    this.refreshAccount()
    this.setupScrollAnimation()
    this.startChatAnimation()
    this.fetchStats()
    this.statsInterval = setInterval(this.fetchStats, 30000)
    this.setupNavbarScroll()
  },
  beforeDestroy () {
    clearInterval(this.statsInterval)
    clearInterval(this.chatInterval)
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    refreshAccount () {
      const s = ensureCleanSession()
      if (s.valid) {
        const u = s.user || {}
        this.account = {
          name: u.displayName || u.fullname || u.username || 'ผู้ใช้',
          isAdmin: (u.role || s.payload.role) === 'admin'
        }
      } else {
        this.account = null
      }
    },
    enterApp () {
      this.$router.push('/chat/chat')
    },
    signOut () {
      try {
        if (this.$socket) {
          this.$socket.emit('statusChanged', { status: 'offline' })
          this.$socket.disconnect()
          this.$socket.connect()
        }
      } catch (e) {}
      clearAuth()
      this.$store.commit('setUserData', null)
      this.account = null
    },
    joinCommunity () {
      this.$router.push('/login')
    },
    goRegister () {
      this.$router.push('/register')
    },
    learnMore () {
      this.$bvModal.show('info-modal')
    },
    setupScrollAnimation () {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true
            this.animateCounters()
          }
        })
      })

      const statsSection = document.querySelector('.stats-section')
      if (statsSection) {
        observer.observe(statsSection)
      }
    },
    animateCounters () {
      this.stats.forEach((stat, index) => {
        let current = 0
        const target = stat.value
        const increment = target / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          this.$set(this.animatedStats, index, Math.floor(current).toLocaleString())
        }, 20)
      })
    },
    async fetchStats () {
      try {
        const res = await this.$axios.$get(process.env.API_STATS)
        const s = res.result
        if (!s) { return }

        this.onlineUsers = s.onlineUsers || 0

        const next = [
          { value: s.totalUsers || 0, label: 'สมาชิกทั้งหมด' },
          { value: s.totalRooms || 0, label: 'ห้องแชท' },
          { value: s.totalMessages || 0, label: 'ข้อความทั้งหมด' },
          { value: s.onlineUsers || 0, label: 'ออนไลน์ตอนนี้' }
        ]
        this.stats = next

        if (this.statsAnimated) {
          next.forEach((stat, i) => {
            this.$set(this.animatedStats, i, stat.value.toLocaleString())
          })
        }
      } catch (err) {
      }
    },

    startChatAnimation () {
      this.chatInterval = setInterval(() => {
        if (this.chatMessages.length > 6) {
          this.chatMessages.shift()
        }

        const newMessage = this.newChatMessages[this.chatMessageIndex % this.newChatMessages.length]
        this.chatMessages.push(newMessage)
        this.chatMessageIndex++

        this.$nextTick(() => {
          if (this.$refs.chatMessages) {
            this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight
          }
        })
      }, 3000)
    },
    scrollToSection (sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        const navbarHeight = 70
        const offsetTop = element.offsetTop - navbarHeight
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    },
    setupNavbarScroll () {
      window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.custom-navbar')
        if (navbar) {
          if (window.scrollY > 50) {
            navbar.classList.add('scrolled')
          } else {
            navbar.classList.remove('scrolled')
          }
        }
      })
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Kanit', sans-serif;
}

i.fas,
i.far,
i.fal,
i.fab,
i.fa,
i[class*="fa-"] {
  font-family: 'Font Awesome 7 Free', 'Font Awesome 7 Brands', 'Font Awesome 6 Free', 'Font Awesome 5 Free' !important;
}

i.fab,
i.fa-brands {
  font-family: 'Font Awesome 7 Brands', 'Font Awesome 6 Brands', 'Font Awesome 5 Brands' !important;
  font-weight: 400 !important;
}

i.fas,
i.fa,
i.fa-solid {
  font-weight: 900 !important;
}

.custom-navbar {
  background: transparent !important;
  padding-top: 18px;
  transition: padding 0.25s ease;
}

.custom-navbar.scrolled {
  padding-top: 10px;
}

.custom-navbar .container {
  background: rgba(18, 18, 24, 0.96);
  border: 2px solid #000;
  border-radius: 999px;
  padding: 10px 20px;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-navbar .navbar-brand {
  margin-right: 0;
}

.custom-navbar .navbar-collapse {
  flex-basis: auto;
  margin-left: 20px;
}

.navbar-brand-custom {
  font-size: 18px !important;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #f6f3ed;
}

.nav-item-custom {
  margin: 0 4px;
  padding: 8px 14px;
  border-radius: 999px;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 14px !important;
  font-weight: 600;
  color: rgba(246, 243, 237, 0.82);
}

.nav-item-custom:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item-custom.join-btn,
.nav-item-custom.login-btn {
  margin-left: 10px;
  color: #121218 !important;
  font-weight: 700;
  border: 2px solid #000;
}

.nav-item-custom.join-btn {
  background: #ff5c4d;
}

.nav-item-custom.login-btn {
  background: #ffc94d;
}

.nav-item-custom.join-btn:hover,
.nav-item-custom.login-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 #000;
}

.navbar-toggler {
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  margin-left: auto;
}

.navbar-toggler:focus {
  box-shadow: none;
  outline: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(246, 243, 237, 0.9)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

@media (max-width: 991px) {
  .custom-navbar .container {
    padding: 10px 16px;
  }

  .custom-navbar .navbar-collapse {
    margin-left: 0;
    margin-top: 16px;
    background: rgba(18, 18, 24, 0.98);
    border: 2px solid #000;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.9);
  }

  .navbar-nav {
    text-align: center;
    font-size: 14px !important;
    width: 100%;
  }

  .nav-center {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;
  }

  .nav-item-custom {
    margin: 6px 0;
    display: block;
    width: 100%;
    text-align: center;
    padding: 10px 16px;
  }

  .nav-item-custom.join-btn,
  .nav-item-custom.login-btn {
    margin: 8px auto;
    display: inline-block;
    width: auto;
    min-width: 140px;
  }

  .ml-auto {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .d-flex.justify-content-center {
    width: 100%;
  }
}

.hero-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  background: #121218 !important;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 150px 0 90px;
  text-align: center;
  color: #f6f3ed;
}

.hero-eyebrow {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  border: 2px solid #ffc94d;
  color: #ffc94d;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  margin-bottom: 18px;
}

.hero-title {
  font-size: clamp(2.8rem, 7vw, 5rem);
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: 0.04em;
  line-height: 1.1;
  color: #f6f3ed;
  -webkit-text-stroke: 1px #000;
}

.hero-subtitle {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  margin-bottom: 18px;
  font-weight: 600;
  color: #ff5c4d;
}

.hero-description {
  font-size: 1rem;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
  color: rgba(246, 243, 237, 0.78);
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-bottom: 48px;
}

.btn-primary-custom {
  background: #ff5c4d !important;
  border: 2px solid #000 !important;
  padding: 12px 28px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  border-radius: 999px !important;
  color: #121218 !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.9);
}

.btn-primary-custom:hover {
  transform: translate(-3px, -3px);
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.9);
}

.btn-outline-custom {
  border: 2px solid #f6f3ed !important;
  color: #f6f3ed !important;
  background: transparent !important;
  padding: 12px 28px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  border-radius: 999px !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-outline-custom:hover {
  transform: translate(-3px, -3px);
  box-shadow: 5px 5px 0 rgba(246, 243, 237, 0.5);
}

.hero-stat-card {
  display: inline-block;
  text-align: left;
  background: #7b5cfa !important;
  border: 2px solid #000;
  border-radius: 18px;
  padding: 16px 20px;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
  transform: rotate(-2deg);
  min-width: 240px;
}

.hero-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.hero-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(18, 18, 24, 0.4);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.25);
}

.hero-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 2px;
}

.hero-stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.section-eyebrow {
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #ff5c4d;
  border: 2px solid #ff5c4d;
  border-radius: 999px;
  padding: 6px 16px;
  margin-bottom: 16px;
}

.section-eyebrow-light {
  color: #ffc94d;
  border-color: #ffc94d;
}

.features-section {
  padding: 80px 0;
  background: #f6f3ed;
  text-align: center;
}

.feature-card {
  border-radius: 20px !important;
  border: 2px solid #000 !important;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  text-align: left;
}

.feature-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.9);
}

.feature-card.tone-0 {
  background: #121218 !important;
  color: #f6f3ed !important;
}

.feature-card.tone-1 {
  background: #ff5c4d !important;
  color: #121218 !important;
}

.feature-card.tone-2 {
  background: #7b5cfa !important;
  color: #fff !important;
}

.feature-card.tone-3 {
  background: #ffc94d !important;
  color: #121218 !important;
}

.feature-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.feature-description {
  line-height: 1.6;
  opacity: 0.86;
  font-size: 14px;
}

.chat-demo {
  padding: 80px 0;
  background: #121218 !important;
  color: #f6f3ed;
  text-align: center;
}

.chat-window {
  background: #1c1c26 !important;
  border-radius: 24px;
  border: 2px solid #000;
  overflow: hidden;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.9);
  text-align: left;
}

.chat-header {
  background: #7b5cfa;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  border-bottom: 2px solid #000;
}

.chat-live-badge {
  background: rgba(18, 18, 24, 0.35);
}

.chat-users-pill {
  background: rgba(18, 18, 24, 0.35);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.chat-messages {
  padding: 20px;
  height: 280px;
  overflow-y: auto;
}

.message-bubble {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #f6f3ed;
  padding: 10px 14px;
  border-radius: 16px;
  display: inline-block;
  max-width: 70%;
  font-size: 14px;
}

.message.own .message-bubble {
  background: #ff5c4d !important;
  color: #121218;
  border: 2px solid #000;
  font-weight: 600;
  margin-left: auto;
}

.message.own {
  text-align: right;
}

.message {
  margin-bottom: 16px;
}

.about-section {
  padding: 80px 0;
  background: #f6f3ed;
  text-align: center;
}

.about-card {
  background: #121218 !important;
  border: 2px solid #000;
  border-radius: 20px;
  padding: 36px;
  max-width: 760px;
  margin: 0 auto;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
}

.about-text {
  font-size: 16px;
  color: #f6f3ed;
  line-height: 1.7;
  margin: 0;
}

.testimonials-section {
  padding: 80px 0;
  background: #f6f3ed;
  text-align: center;
}

.testimonial-card {
  border: 2px solid #000 !important;
  border-radius: 22px !important;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.9);
  transition: transform 0.2s ease;
  text-align: left;
}

.testimonial-card:hover {
  transform: translate(-3px, -3px);
}

.testimonial-card.tone-0 {
  background: #ffc94d !important;
}

.testimonial-card.tone-1 {
  background: #ff5c4d !important;
  color: #fff !important;
}

.testimonial-card.tone-2 {
  background: #7b5cfa !important;
  color: #fff !important;
}

.testimonial-text {
  font-size: 15px;
  font-style: italic;
  margin-bottom: 14px;
}

.stats-section {
  padding: 80px 0;
  background: #121218 !important;
  color: #f6f3ed;
  text-align: center;
}

.stat-item {
  position: relative;
  text-align: left;
  border-radius: 18px;
  border: 2px solid #000;
  padding: 22px 18px 18px;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
  margin-bottom: 8px;
}

.stat-item.tone-0 {
  background: #ff5c4d !important;
  color: #121218 !important;
}

.stat-item.tone-1 {
  background: #7b5cfa !important;
  color: #fff !important;
}

.stat-item.tone-2 {
  background: #ffc94d !important;
  color: #121218 !important;
}

.stat-item.tone-3 {
  background: #1c1c26 !important;
  color: #f6f3ed !important;
  border-color: rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 36px !important;
  font-weight: 800;
  margin-bottom: 4px;
  margin-top: 4px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.85;
}

.footer {
  background: #121218 !important;
  color: #cbd5e1;
  padding: 50px 0 25px;
  border-top: 2px solid #000;
}

.footer p,
.footer h5 {
  color: #e2e8f0;
}

.social-links a {
  color: #cbd5e1;
  font-size: 18px;
  margin: 0 6px;
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
}

.social-links a:hover {
  color: #121218;
  background: #ffc94d;
  border-color: #000;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 36px;
  color: #111827;
}

.bg-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.shape {
  position: absolute;
  opacity: 0.9;
  border-radius: 50%;
  border: 2px solid #000;
}

.shape:nth-child(1) {
  top: 14%;
  left: 8%;
  width: 70px;
  height: 70px;
  background: #ff5c4d !important;
}

.shape:nth-child(2) {
  top: 20%;
  right: 10%;
  width: 50px;
  height: 50px;
  background: #ffc94d !important;
  border-radius: 14px;
}

.shape:nth-child(3) {
  bottom: 12%;
  left: 14%;
  width: 38px;
  height: 38px;
  background: #7b5cfa !important;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-description {
    font-size: 14px;
  }

  .btn-primary-custom,
  .btn-outline-custom {
    font-size: 14px !important;
    padding: 10px 22px !important;
    width: 100%;
  }

  .section-title {
    font-size: 22px;
  }

  .stat-number {
    font-size: 28px;
  }

  .hero-content {
    padding: 120px 0 60px;
  }

  .features-section,
  .chat-demo,
  .about-section,
  .testimonials-section,
  .stats-section {
    padding: 60px 0;
  }
}

:deep(.custom-modal .modal-content) {
  background: #1c1c26;
  border: 3px solid #000;
  border-radius: 24px;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.9);
  overflow: hidden;
}

:deep(.custom-modal-header) {
  background: linear-gradient(135deg, #7b5cfa 0%, #5b4fd6 100%);
  color: white;
  border-bottom: 3px solid #000;
  padding: 20px 24px;
  font-family: 'Kanit', sans-serif;
}

:deep(.custom-modal-header .modal-title) {
  font-size: 1.25rem !important;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

:deep(.custom-modal-header .close) {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 1;
  font-size: 1.2rem !important;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
}

:deep(.custom-modal-header .close:hover) {
  background: #ff5c4d;
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 #000;
}

:deep(.custom-modal-body) {
  padding: 24px;
  background: #f6f3ed;
  font-family: 'Kanit', sans-serif;
}

:deep(.nav-tabs) {
  border-bottom: 2px solid #000;
  margin-bottom: 24px;
  gap: 8px;
}

:deep(.nav-tabs .nav-link) {
  border: 2px solid #000;
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #121218;
  background: #ffc94d;
  transition: all 0.2s ease;
}

:deep(.nav-tabs .nav-link:hover) {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 #000;
}

:deep(.nav-tabs .nav-link.active) {
  background: linear-gradient(135deg, #7b5cfa 0%, #5b4fd6 100%);
  color: white;
  border-color: #000;
  box-shadow: 4px 4px 0 #000;
  transform: translate(-2px, -2px);
}

:deep(.tab-content) {
  background: #fff;
  border: 2px solid #000;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.9);
}

:deep(.list-group-item) {
  border: 2px solid #000;
  border-radius: 12px;
  margin-bottom: 10px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

:deep(.list-group-item:hover) {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 #000;
  background: #fff8e8;
}

:deep(.chat-room-item) {
  padding: 16px;
}

:deep(.user-badge) {
  background: #7b5cfa !important;
  color: white;
  border: 2px solid #000;
  padding: 6px 12px;
  font-weight: 600;
  border-radius: 999px;
}

.highlight-sub {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #7b5cfa;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid #000;
}

.styled-list,
.styled-ol {
  padding-left: 0;
  list-style: none;
}

.styled-list li,
.styled-ol li {
  background: #fff;
  border: 2px solid #000;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
  font-size: 15px;
  line-height: 1.6;
}

.styled-list li:hover,
.styled-ol li:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
  background: #fff8e8;
}

.styled-ol {
  counter-reset: item;
}

.styled-ol li {
  position: relative;
  padding-left: 50px;
}

.styled-ol li::before {
  content: counter(item);
  counter-increment: item;
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #ff5c4d;
  color: white;
  border: 2px solid #000;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.nav-tabs .nav-link.active {
  background: #7b5cfa;
  color: white;
  border-color: transparent;
}

.nav-tabs .nav-link:hover {
  border-color: #7b5cfa;
}

.list-group-item {
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.list-group-item:hover {
  border-left-color: #7b5cfa;
  background-color: #f8f9fa;
}

.form-control:focus {
  border-color: #7b5cfa;
  box-shadow: 0 0 0 0.2rem rgba(123, 92, 250, 0.25);
}

.toast {
  border-radius: 15px;
}

.feature-card {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
.feature-card:nth-child(5) { animation-delay: 0.5s; }
.feature-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

html {
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #1c1c26;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #7b5cfa;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #ff5c4d;
}

.custom-modal {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.45);
}

.custom-modal-header {
  background: #7b5cfa;
  color: #fff;
  font-weight: 600;
  font-size: 24px !important;
  border: none;
}

.custom-modal-body {
  padding: 30px;
  color: #333;
}

.join-form input {
  border-radius: 12px;
  padding: 12px 15px;
}

.custom-checkbox {
  font-size: 14px;
  color: #444;
}

.styled-list li,
.styled-ol li {
  font-size: 16px;
  line-height: 1.8;
}

.chat-room-item {
  border-radius: 14px;
  padding: 14px 18px;
  transition: background 0.3s ease;
}

.chat-room-item:hover {
  background: rgba(123, 92, 250, 0.09);
}

.user-badge {
  border-radius: 12px;
  font-weight: 600;
}

.highlight-sub {
  font-weight: 600;
  margin-bottom: 12px;
  color: #7b5cfa;
}
</style>

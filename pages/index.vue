<template>
  <div style="font-size: 20px;">
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
            <b-nav-item class="nav-item-custom login-btn" @click="joinCommunity">
              <i class="fa-solid fa-right-to-bracket" /> Login
            </b-nav-item>
            <b-nav-item class="nav-item-custom join-btn" @click="goRegister">
              <i class="fas fa-user-plus mr-1" />สมัครเข้าร่วมกับเรา
            </b-nav-item>
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
            <span class="arrow-btn">↗</span>
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
                  <span class="arrow-btn">↗</span>
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
              <span class="arrow-btn stat-arrow">↗</span>
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
            <li style="font-size: 22px;">
              ⚡ แชทแบบเรียลไทม์ไม่มีดีเลย์
            </li>
            <li style="font-size: 22px;">
              📂 ห้องแชทแยกตามหมวดหมู่
            </li>
            <li style="font-size: 22px;">
              🔒 ระบบรักษาความปลอดภัยสูง
            </li>
            <li style="font-size: 22px;">
              🎨 Interface ใช้งานง่าย
            </li>
            <li style="font-size: 22px;">
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
            <li style="font-size: 22px;">
              🙏 เคารพสมาชิกคนอื่น
            </li>
            <li style="font-size: 22px;">
              🚫 ไม่โพสต์เนื้อหาที่ไม่เหมาะสม
            </li>
            <li style="font-size: 22px;">
              💡 ไม่ Spam หรือ Flood ข้อความ
            </li>
            <li style="font-size: 22px;">
              🗣 ใช้ภาษาที่สุภาพ
            </li>
            <li style="font-size: 22px;">
              🔐 ไม่แชร์ข้อมูลส่วนตัวของคนอื่น
            </li>
          </ol>
        </b-tab>
      </b-tabs>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'RaiSaRaLanding',
  data () {
    return {
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
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },
  computed: {
    canJoin () {
      return this.joinForm.username &&
             this.joinForm.email &&
             this.joinForm.agree
    }
  },
  mounted () {
    this.setupScrollAnimation()
    this.startChatAnimation()
    this.updateOnlineUsers()
    this.setupNavbarScroll()
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
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
    startChatAnimation () {
      setInterval(() => {
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
    updateOnlineUsers () {
      setInterval(() => {
        const variation = Math.floor(Math.random() * 20) - 10
        this.onlineUsers = Math.max(1200, Math.min(1300, this.onlineUsers + variation))
      }, 5000)
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

.fas,
.far,
.fal,
.fab,
.fa {
  font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
}

.fab {
  font-family: "Font Awesome 6 Brands" !important;
  font-weight: 400 !important;
}

.fas,
.fa {
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
  padding: 8px 20px;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.9);
}

.navbar-brand-custom {
  font-size: 18px !important;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #f6f3ed;
}

.nav-item-custom {
  margin: 0 4px;
  padding: 10px 16px;
  border-radius: 999px;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 15px !important;
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
}

.navbar-toggler:focus {
  box-shadow: none;
}

@media (max-width: 991px) {
  .navbar-nav {
    text-align: center;
    font-size: 16px !important;
  }

  .nav-item-custom {
    margin: 6px 0;
    display: block;
  }

  .nav-item-custom.join-btn,
  .nav-item-custom.login-btn {
    margin: 8px auto;
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
  max-width: 760px;
  margin: 0 auto;
  padding: 180px 0 110px;
  text-align: center;
  color: #f6f3ed;
}

.hero-eyebrow {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 999px;
  border: 2px solid #ffc94d;
  color: #ffc94d;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.14em;
  margin-bottom: 22px;
}

.hero-title {
  font-size: clamp(3.2rem, 8vw, 6rem);
  font-weight: 800;
  margin-bottom: 14px;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #f6f3ed;
  -webkit-text-stroke: 1px #000;
}

.hero-subtitle {
  font-size: clamp(1.3rem, 2.2vw, 1.7rem);
  margin-bottom: 22px;
  font-weight: 600;
  color: #ff5c4d;
}

.hero-description {
  font-size: 1.1rem;
  margin-bottom: 36px;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.75;
  color: rgba(246, 243, 237, 0.78);
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 56px;
}

.btn-primary-custom {
  background: #ff5c4d !important;
  border: 2px solid #000 !important;
  padding: 14px 34px !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  border-radius: 999px !important;
  color: #121218 !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
}

.btn-primary-custom:hover {
  transform: translate(-3px, -3px);
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.9);
}

.btn-outline-custom {
  border: 2px solid #f6f3ed !important;
  color: #f6f3ed !important;
  background: transparent !important;
  padding: 14px 34px !important;
  font-size: 17px !important;
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
  border-radius: 24px;
  padding: 22px 26px;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.9);
  transform: rotate(-2deg);
  min-width: 280px;
}

.hero-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.hero-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(18, 18, 24, 0.4);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 14px;
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

.arrow-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #121218;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  border: 2px solid #000;
}

.hero-stat-value {
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 2px;
}

.hero-stat-label {
  font-size: 14px;
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
  padding: 110px 0;
  background: #f6f3ed;
  text-align: center;
}

.feature-card {
  border-radius: 24px !important;
  border: 2px solid #000 !important;
  box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  text-align: left;
}

.feature-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.9);
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
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.feature-title {
  font-size: 21px;
  font-weight: 700;
  margin-bottom: 12px;
}

.feature-description {
  line-height: 1.7;
  opacity: 0.86;
  font-size: 16px;
}

.chat-demo {
  padding: 110px 0;
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
  padding: 24px;
  height: 320px;
  overflow-y: auto;
}

.message-bubble {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #f6f3ed;
  padding: 12px 16px;
  border-radius: 18px;
  display: inline-block;
  max-width: 72%;
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
  padding: 100px 0;
  background: #f6f3ed;
  text-align: center;
}

.about-card {
  background: #121218 !important;
  border: 2px solid #000;
  border-radius: 24px;
  padding: 44px;
  max-width: 820px;
  margin: 0 auto;
  box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.9);
}

.about-text {
  font-size: 19px;
  color: #f6f3ed;
  line-height: 1.8;
  margin: 0;
}

.testimonials-section {
  padding: 100px 0;
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
  font-size: 18px;
  font-style: italic;
  margin-bottom: 16px;
}

.stats-section {
  padding: 100px 0;
  background: #121218 !important;
  color: #f6f3ed;
  text-align: center;
}

.stat-item {
  position: relative;
  text-align: left;
  border-radius: 22px;
  border: 2px solid #000;
  padding: 26px 22px 22px;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.9);
  margin-bottom: 10px;
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

.stat-arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  font-size: 14px;
}

.stat-number {
  font-size: 42px !important;
  font-weight: 800;
  margin-bottom: 6px;
  margin-top: 6px;
}

.stat-label {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.85;
}

.footer {
  background: #121218 !important;
  color: #cbd5e1;
  padding: 60px 0 30px;
  border-top: 2px solid #000;
}

.footer p,
.footer h5 {
  color: #e2e8f0;
}

.social-links a {
  color: #cbd5e1;
  font-size: 20px;
  margin: 0 8px;
  display: inline-flex;
  width: 42px;
  height: 42px;
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
  font-size: 34px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 40px;
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
  width: 90px;
  height: 90px;
  background: #ff5c4d !important;
}

.shape:nth-child(2) {
  top: 20%;
  right: 10%;
  width: 60px;
  height: 60px;
  background: #ffc94d !important;
  border-radius: 16px;
}

.shape:nth-child(3) {
  bottom: 12%;
  left: 14%;
  width: 46px;
  height: 46px;
  background: #7b5cfa !important;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.6rem;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .hero-description {
    font-size: 16px;
  }

  .btn-primary-custom,
  .btn-outline-custom {
    font-size: 15px !important;
    padding: 12px 26px !important;
    width: 100%;
  }

  .section-title {
    font-size: 26px;
  }

  .stat-number {
    font-size: 34px;
  }

  .hero-content {
    padding: 140px 0 70px;
  }
}

/* Custom Modal Styling */
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
  font-size: 1.5rem !important;
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
  padding: 28px;
  background: #f6f3ed;
  font-family: 'Kanit', sans-serif;
}

/* Tabs Styling */
:deep(.nav-tabs) {
  border-bottom: 2px solid #000;
  margin-bottom: 24px;
  gap: 8px;
}

:deep(.nav-tabs .nav-link) {
  border: 2px solid #000;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.95rem;
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
  padding: 24px;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
}

/* List Group Styling */
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

/* Styled Lists */
.highlight-sub {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #7b5cfa;
  margin-bottom: 20px;
  padding-bottom: 12px;
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
  padding: 14px 18px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
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

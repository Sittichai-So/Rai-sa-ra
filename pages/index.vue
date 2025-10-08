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
              style="border: 2px solid #fff; border-radius: 25px;"
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
      <div class="floating-shapes" />
      <div class="bg-shapes">
        <div class="shape" />
        <div class="shape" />
        <div class="shape" />
      </div>
      <b-container class="hero-content">
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
            class="btn-primary-custom pulse mr-3 mb-2"
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
      </b-container>
    </section>

    <section id="features" class="features-section">
      <b-container>
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
              no-body
            >
              <b-card-body class="text-center">
                <div class="feature-icon">
                  <i :class="feature.icon" />
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
        <h2 class="section-title text-white">
          ลองดูการสนทนา
        </h2>
        <b-row>
          <b-col md="8" class="mx-auto">
            <div class="chat-window">
              <div class="chat-header">
                <div class="d-flex align-items-center">
                  <div class="mr-3">
                    <b-badge variant="success" pill />
                    <span class="ml-2">ห้องแชทเกม</span>
                  </div>
                  <div class="ml-auto">
                    <i class="fas fa-users" /> {{ onlineUsers.toLocaleString() }} คน
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
        <h2 class="section-title">
          เกี่ยวกับเรา
        </h2>
        <p class="about-text">
          <strong>RAI-SA-RA</strong> ถูกสร้างขึ้นเพื่อเชื่อมโยงคนไทยจากทั่วทุกมุมโลก
          เราเชื่อในพลังของการสนทนา การแบ่งปันความรู้ และการสร้างมิตรภาพใหม่ๆ
          ไม่ว่าจะเป็นเรื่องเกม การเรียน กีฬา หรือแม้แต่ชีวิตประจำวัน
        </p>
      </b-container>
    </section>

    <section id="testimonials" class="testimonials-section">
      <b-container>
        <h2 class="section-title">
          เสียงจากชุมชน
        </h2>
        <b-row>
          <b-col v-for="(review, index) in reviews" :key="index" md="4" class="mb-4">
            <b-card class="testimonial-card h-100">
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
        <b-row>
          <b-col
            v-for="(stat, index) in stats"
            :key="index"
            md="3"
            class="mb-4"
          >
            <div class="stat-item text-center">
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
        <hr style="border-color: #555; margin: 30px 0;">
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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap' }
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
/* .nav-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
} */

.submit-btn {
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  border: none;
  color: #333;
  font-weight: 600;
}
.submit-btn:hover {
  background: linear-gradient(135deg, #ffdde1, #ee9ca7);
}
.custom-navbar {
  background: rgba(44, 62, 80, 0.95) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.custom-navbar.scrolled {
  background: rgba(44, 62, 80, 0.98) !important;
  box-shadow: 0 2px 30px rgba(0,0,0,0.2);
}

.navbar-brand-custom {
  font-size: 18px !important;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.navbar-brand-custom:hover {
  transform: scale(1.05);
  text-decoration: none;
  font-size: 18px !important;
}

.nav-item-custom {
  margin: 0 10px;
  padding: 0px 2px;
  border-radius: 25px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 18px !important;
}

.nav-item-custom:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
  font-size: 18px !important;
}

.nav-item-custom.join-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white !important;
  margin-left: 20px;
  font-size: 18px !important;
}

.nav-item-custom.join-btn:hover {
  background: linear-gradient(45deg, #764ba2, #667eea);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-3px);
  font-size: 18px !important;
}

.nav-item-custom.login-btn {
  background: linear-gradient(45deg, #6072c2, #ae6eee);
  color: white !important;
  margin-left: 20px;
  font-size: 18px !important;
}

.nav-item-custom.login-btn:hover {
  background: linear-gradient(45deg, #9c5add, #4b5ba3);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-3px);
  font-size: 18px !important;
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
    font-size: 18px !important;
  }

  .nav-item-custom {
    margin: 5px 0;
    display: block;
    font-size: 18px !important;
  }

  .nav-item-custom.join-btn {
    margin: 10px 0;
    font-size: 18px !important;
  }

  .nav-item-custom.login-btn {
    margin: 10px 0;
    font-size: 18px !important;
  }
}

.hero-section {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.floating-shapes::before,
.floating-shapes::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.floating-shapes::before {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: -2s;
}

.floating-shapes::after {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 180px 0 120px;
  text-align: center;
  color: white;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: slideInUp 1s ease-out;
  background: linear-gradient(45deg, #fff, #f093fb, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: slideInUp 1s ease-out, gradient 3s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 30px;
  animation: slideInUp 1s ease-out 0.2s both;
  opacity: 0.9;
}

.hero-description {
  font-size: 22px;
  margin-bottom: 40px;
  animation: slideInUp 1s ease-out 0.4s both;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cta-buttons {
  animation: slideInUp 1s ease-out 0.6s both;
}

.btn-primary-custom {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24) !important;
  border: none !important;
  padding: 15px 40px !important;
  font-size: 22px !important;
  font-weight: 600 !important;
  border-radius: 50px !important;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(238, 90, 36, 0.3);
}

.btn-primary-custom:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(238, 90, 36, 0.4);
  background: linear-gradient(45deg, #ee5a24, #ff6b6b) !important;
}

.btn-outline-custom {
  border: 2px solid white !important;
  color: white !important;
  background: transparent !important;
  padding: 15px 40px !important;
  font-size: 22px !important;
  font-weight: 600 !important;
  border-radius: 50px !important;
  transition: all 0.3s ease;
}

.btn-outline-custom:hover {
  background: white !important;
  color: #667eea !important;
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.2);
}

.features-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5f7fa 100%);
}

.feature-card {
  background: white;
  border-radius: 20px !important;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: none !important;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: 0.5s;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

.chat-demo {
  padding: 100px 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.chat-window {
  background: #2f3640;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.chat-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  padding: 15px 20px;
  display: flex;
  align-items: center;
}

.chat-messages {
  padding: 20px;
  height: 300px;
  overflow-y: auto;
}

.message {
  margin-bottom: 15px;
  animation: messageSlide 0.5s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-bubble {
  background: #4a5568;
  padding: 10px 15px;
  border-radius: 20px;
  display: inline-block;
  max-width: 70%;
}

.message.own .message-bubble {
  background: linear-gradient(45deg, #667eea, #764ba2);
  margin-left: auto;
}

.message.own {
  text-align: right;
}

.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-item {
  text-align: center;
  margin-bottom: 30px;
}

.stat-number {
  font-size: 50px !important;
  font-weight: 700;
  display: block;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 22px;
  opacity: 0.9;
}

.footer {
  background: #2c3e50;
  color: white;
  padding: 60px 0 30px;
}

.social-links a {
  color: white;
  font-size: 24px;
  margin: 0 15px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-links a:hover {
  color: #667eea;
  transform: translateY(-3px);
  text-decoration: none;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 2px;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

.bg-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -2;
}

.shape {
  position: absolute;
  opacity: 0.1;
  animation: rotate 20s linear infinite;
}

.shape:nth-child(1) {
  top: 10%;
  left: 10%;
  width: 100px;
  height: 100px;
  background: #ff6b6b;
  border-radius: 50%;
  animation-delay: 0s;
}

.shape:nth-child(2) {
  top: 20%;
  right: 10%;
  width: 80px;
  height: 80px;
  background: #4ecdc4;
  animation-delay: -5s;
}

.shape:nth-child(3) {
  bottom: 20%;
  left: 20%;
  width: 60px;
  height: 60px;
  background: #45b7d1;
  border-radius: 50%;
  animation-delay: -10s;
}

@keyframes rotate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 22px;
  }

  .hero-description {
    font-size: 22px;
  }

  .btn-primary-custom,
  .btn-outline-custom {
    font-size: 22px !important;
    padding: 12px 30px !important;
    margin: 5px;
    display: block;
    width: 100%;
  }

  .section-title {
    font-size: 24px;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .stat-number {
    font-size: 50px;
  }

  .hero-content {
    padding: 140px 0 80px;
  }
}

.modal-content {
  border-radius: 20px;
  border: none;
}

.modal-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px 20px 0 0;
  font-size: 24px !important;
}

.modal-header .close {
  color: white;
  opacity: 0.8;
  font-size: 24px !important;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

.nav-tabs .nav-link:hover {
  border-color: #667eea;
}

.list-group-item {
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.list-group-item:hover {
  border-left-color: #667eea;
  background-color: #f8f9fa;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
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
  background: #2f3640;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
.custom-modal {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.45);
}
.custom-modal-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
  font-size: 24px !important;
  border: none;
}
.custom-modal-body {
  padding: 30px;
  color: #333;
}
.highlight-title {
  font-size: 26px;
  font-weight: 700;
  color: #764ba2;
}
.subtitle {
  font-size: 16px;
  opacity: 0.8;
}
.join-form input {
  border-radius: 12px;
  padding: 12px 15px;
}
.custom-checkbox {
  font-size: 14px;
  color: #444;
}
.join-btn {
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  border: none;
  color: #333;
  font-weight: 600;
  transition: 0.3s;
}
.join-btn:hover {
  background: linear-gradient(135deg, #ffdde1, #ee9ca7);
}
.styled-list li {
  font-size: 16px;
  padding: 6px 0;
}
.styled-ol li {
  font-size: 16px;
  margin: 8px 0;
}
.chat-room-item {
  border-radius: 12px;
  padding: 12px 15px;
  transition: background 0.3s;
}
.chat-room-item:hover {
  background: rgba(118, 75, 162, 0.1);
}
.user-badge {
  border-radius: 10px;
  font-weight: 600;
}
.highlight-sub {
  font-weight: 600;
  margin-bottom: 10px;
  color: #667eea;
}
.about-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  text-align: center;
}
.about-section .section-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #222;
}
.about-text {
  font-size: 20px;
  color: #555;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
}

.testimonials-section {
  padding: 80px 0;
  background: #fff;
}
.testimonials-section .section-title {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 50px;
}
.testimonial-card {
  border: none;
  background: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}
.testimonial-card:hover {
  transform: translateY(-8px);
}
.testimonial-text {
  font-size: 18px;
  color: #333;
  font-style: italic;
  margin-bottom: 15px;
}
</style>

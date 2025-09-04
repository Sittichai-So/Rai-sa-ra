<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
      <b-container>
        <b-navbar-brand href="#" class="navbar-brand-custom">
          <strong>RAI-SA-RA</strong>
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item class="nav-item-custom" @click="scrollToSection('hero')">
              <i class="fas fa-home mr-1" />หน้าแรก
            </b-nav-item>
            <b-nav-item class="nav-item-custom" @click="scrollToSection('features')">
              <i class="fas fa-star mr-1" />คุณสมบัติ
            </b-nav-item>
            <b-nav-item class="nav-item-custom" @click="scrollToSection('chat-demo')">
              <i class="fas fa-comments mr-1" />ตัวอย่างแชท
            </b-nav-item>
            <b-nav-item class="nav-item-custom" @click="scrollToSection('stats')">
              <i class="fas fa-chart-bar mr-1" />สถิติ
            </b-nav-item>
            <b-nav-item class="nav-item-custom join-btn" @click="joinCommunity">
              <i class="fas fa-user-plus mr-1" />เข้าร่วม
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
            <h3>RAI-SA-RA</h3>
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
      id="join-modal"
      title="เข้าร่วมชุมชน RAI-SA-RA"
      size="lg"
      centered
      hide-footer
    >
      <div class="text-center">
        <h4>ยินดีต้อนรับสู่ RAI-SA-RA!</h4>
        <p>กรอกข้อมูลเพื่อเข้าร่วมชุมชนที่เจ๋งที่สุด</p>
        <b-form @submit.prevent="handleJoin">
          <b-form-group label="ชื่อผู้ใช้" label-for="username">
            <b-form-input
              id="username"
              v-model="joinForm.username"
              required
              placeholder="กรอกชื่อผู้ใช้"
            />
          </b-form-group>
          <b-form-group label="อีเมล" label-for="email">
            <b-form-input
              id="email"
              v-model="joinForm.email"
              type="email"
              required
              placeholder="กรอกอีเมล"
            />
          </b-form-group>
          <b-form-group>
            <b-form-checkbox v-model="joinForm.agree">
              ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
            </b-form-checkbox>
          </b-form-group>
          <b-button
            type="submit"
            variant="primary"
            size="lg"
            :disabled="!canJoin"
            class="mt-3"
          >
            เข้าร่วมเลย!
          </b-button>
        </b-form>
      </div>
    </b-modal>

    <b-modal
      id="info-modal"
      title="ข้อมูลเพิ่มเติม"
      size="xl"
      centered
      hide-footer
    >
      <b-tabs content-class="mt-3">
        <b-tab title="คุณสมบัติ" active>
          <h5>คุณสมบัติเด่นของ RAI-SA-RA</h5>
          <ul>
            <li>✅ แชทแบบเรียลไทม์ไม่มีดีเลย์</li>
            <li>✅ ห้องแชทแยกตามหมวดหมู่</li>
            <li>✅ ระบบรักษาความปลอดภัยสูง</li>
            <li>✅ Interface ใช้งานง่าย</li>
            <li>✅ Support ทั้ง Desktop และ Mobile</li>
          </ul>
        </b-tab>
        <b-tab title="ห้องแชท">
          <h5>ห้องแชทยอดนิยม</h5>
          <b-list-group>
            <b-list-group-item v-for="room in chatRooms" :key="room.name">
              <div class="d-flex justify-content-between">
                <strong>{{ room.name }}</strong>
                <b-badge variant="primary">
                  {{ room.users }} คน
                </b-badge>
              </div>
              <small class="text-muted">{{ room.description }}</small>
            </b-list-group-item>
          </b-list-group>
        </b-tab>
        <b-tab title="กฎระเบียบ">
          <h5>กฎของชุมชน</h5>
          <ol>
            <li>เคารพสมาชิกคนอื่น</li>
            <li>ไม่โพสต์เนื้อหาที่ไม่เหมาะสม</li>
            <li>ไม่ Spam หรือ Flood ข้อความ</li>
            <li>ใช้ภาษาที่สุภาพ</li>
            <li>ไม่แชร์ข้อมูลส่วนตัวของคนอื่น</li>
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
      joinForm: {
        username: '',
        email: '',
        agree: false
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
    joinCommunity () {
      this.$bvModal.show('join-modal')
    },
    learnMore () {
      this.$bvModal.show('info-modal')
    },
    handleJoin () {
      this.$bvModal.hide('join-modal')
      this.$bvToast.toast('ยินดีต้อนรับสู่ชุมชน RAI-SA-RA! 🎉', {
        title: 'เข้าร่วมสำเร็จ',
        variant: 'success',
        solid: true,
        autoHideDelay: 3000
      })
      this.joinForm = { username: '', email: '', agree: false }
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
        const navbarHeight = 80 // Navbar height
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

<style>
/* Custom Navbar Styles */
.custom-navbar {
  background: rgba(44, 62, 80, 0.95) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  padding: 10px 0;
}

.custom-navbar.scrolled {
  background: rgba(44, 62, 80, 0.98) !important;
  box-shadow: 0 2px 30px rgba(0,0,0,0.2);
}

.navbar-brand-custom {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.navbar-brand-custom:hover {
  transform: scale(1.05);
  text-decoration: none;
}

.nav-item-custom {
  margin: 0 10px;
  padding: 8px 16px;
  border-radius: 25px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
}

.nav-item-custom:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.nav-item-custom.join-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white !important;
  margin-left: 20px;
}

.nav-item-custom.join-btn:hover {
  background: linear-gradient(45deg, #764ba2, #667eea);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-3px);
}

.navbar-toggler {
  border: none;
  padding: 4px 8px;
}

.navbar-toggler:focus {
  box-shadow: none;
}

/* Mobile navbar adjustments */
@media (max-width: 991px) {
  .navbar-nav {
    text-align: center;
    padding-top: 20px;
  }

  .nav-item-custom {
    margin: 5px 0;
    display: block;
  }

  .nav-item-custom.join-btn {
    margin: 10px 0;
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
  font-size: 1.5rem;
  margin-bottom: 30px;
  animation: slideInUp 1s ease-out 0.2s both;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.2rem;
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
  font-size: 1.2rem !important;
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
  font-size: 1.2rem !important;
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
  font-size: 3rem;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-title {
  font-size: 1.5rem;
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
  font-size: 3rem;
  font-weight: 700;
  display: block;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.2rem;
  opacity: 0.9;
}

.footer {
  background: #2c3e50;
  color: white;
  padding: 60px 0 30px;
}

.social-links a {
  color: white;
  font-size: 1.5rem;
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
  font-size: 3rem;
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
  z-index: -1;
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

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .btn-primary-custom,
  .btn-outline-custom {
    font-size: 1rem !important;
    padding: 12px 30px !important;
    margin: 5px;
    display: block;
    width: 100%;
  }

  .section-title {
    font-size: 2rem;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .hero-content {
    padding: 140px 0 80px;
  }
}

/* Custom Bootstrap Vue Overrides */
.modal-content {
  border-radius: 20px;
  border: none;
}

.modal-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header .close {
  color: white;
  opacity: 0.8;
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

/* Additional animations */
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

/* Global font family */
* {
  font-family: 'Kanit', sans-serif;
}

/* Smooth scrolling for the whole page */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar for chat messages */
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
</style>

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
/* Navigation */
.custom-navbar {
  background: rgba(15, 23, 42, 0.88) !important;
    backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
          transition: background 0.3s ease, box-shadow 0.3s ease;
          }

.custom-navbar.scrolled {
  background: rgba(15, 23, 42, 0.96) !important;
  }

.navbar-brand-custom {
  font-size: 18px !important;
    font-weight: 700;
      letter-spacing: 0.02em;
        background: linear-gradient(45deg, #8b5cf6, #ec4899);
  background-clip: text;
            -webkit-text-fill-color: transparent;
            }

.navbar-brand-custom:hover {
  transform: scale(1.04);
  }

.nav-item-custom {
  margin: 0 8px;
    padding: 10px 16px;
      border-radius: 999px;
        transition: all 0.25s ease;
          cursor: pointer;
            font-size: 16px !important;
              color: rgba(255, 255, 255, 0.9);
              }

.nav-item-custom:hover {
  background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
    }

.nav-item-custom.join-btn,
.nav-item-custom.login-btn {
  margin-left: 16px;
    color: #fff !important;
      }

.nav-item-custom.join-btn {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  }

.nav-item-custom.login-btn {
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  }

.nav-item-custom.join-btn:hover,
.nav-item-custom.login-btn:hover {
  transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16);
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
      margin: 8px 0;
          display: block;
            }

  .nav-item-custom.join-btn,
    .nav-item-custom.login-btn {
        margin: 10px auto;
          }
          }

/* Hero section */
.hero-section {
  min-height: 100vh;
    position: relative;
      display: flex;
        align-items: center;
          background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.16), transparent 20%),
              radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.12), transparent 18%),
                  linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #ec4899 100%);
                    overflow: hidden;
                    }

.hero-section::before {
  content: '';
    position: absolute;
      inset: 0;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.12), transparent 40%);
          pointer-events: none;
            z-index: 1;
            }

.hero-content {
  position: relative;
    z-index: 2;
      width: 100%;
        max-width: 900px;
          margin: 0 auto;
            padding: 160px 0 100px;
              text-align: center;
                color: #f8fafc;
                  }

.hero-title {
  font-size: clamp(3rem, 6vw, 5.2rem);
    font-weight: 800;
      margin-bottom: 18px;
        letter-spacing: 0.08em;
          line-height: 1.05;
            text-shadow: 0 24px 45px rgba(15, 23, 42, 0.22);
              background: linear-gradient(90deg, #ffffff, #f9c0ff, #fff);
  background-clip: text;
                  }

.hero-subtitle {
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
    margin-bottom: 24px;
      opacity: 0.92;
      }

.hero-description {
  font-size: 1.15rem;
    margin-bottom: 42px;
      max-width: 680px;
        margin-left: auto;
          margin-right: auto;
            line-height: 1.75;
              color: rgba(248, 250, 252, 0.92);
              }

.cta-buttons {
  display: flex;
    flex-wrap: wrap;
      justify-content: center;
        gap: 16px;
        }

.btn-primary-custom {
  background: linear-gradient(135deg, #fb7185, #f59e0b) !important;
    border: none !important;
      padding: 14px 36px !important;
        font-size: 18px !important;
          font-weight: 700 !important;
            border-radius: 999px !important;
              transition: all 0.3s ease;
                box-shadow: 0 18px 35px rgba(251, 113, 133, 0.24);
                }

.btn-primary-custom:hover {
  transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(251, 113, 133, 0.28);
      background: linear-gradient(135deg, #f59e0b, #fb7185) !important;
      }

.btn-outline-custom {
  border: 2px solid rgba(255, 255, 255, 0.95) !important;
    color: #ffffff !important;
        background: rgba(255, 255, 255, 0.08) !important;
          padding: 14px 36px !important;
            font-size: 18px !important;
              font-weight: 700 !important;
                border-radius: 999px !important;
                  transition: all 0.3s ease;
                  }

.btn-outline-custom:hover {
  background: #ffffff !important;
      color: #4338ca !important;
          transform: translateY(-2px);
            box-shadow: 0 18px 35px rgba(255, 255, 255, 0.22);
            }

/* Feature cards */
.features-section {
  padding: 100px 0;
    background: #f8fafc;
      }

.feature-card {
  background: #ffffff;
      border-radius: 24px !important;
        box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: none !important;
              overflow: hidden;
              }

.feature-card:hover {
  transform: translateY(-10px);
    box-shadow: 0 28px 50px rgba(15, 23, 42, 0.12);
    }

.feature-icon {
  font-size: 32px;
    margin-bottom: 18px;
      background: linear-gradient(45deg, #4338ca, #8b5cf6);
        background-clip: text;
        -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          }

.feature-title {
  font-size: 22px;
    font-weight: 700;
      margin-bottom: 14px;
        color: #111827;
          }

.feature-description {
  color: #475569;
      line-height: 1.7;
      }

/* Chat demo */
.chat-demo {
  padding: 100px 0;
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
      color: #f8fafc;
        }

.chat-window {
  background: rgba(15, 23, 42, 0.94);
    border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
        overflow: hidden;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
          }

.chat-header {
  background: linear-gradient(135deg, #4338ca, #7c3aed);
    padding: 16px 22px;
      display: flex;
        align-items: center;
        }

.chat-messages {
  padding: 24px;
    height: 320px;
      overflow-y: auto;
      }

.message-bubble {
  background: rgba(148, 163, 184, 0.18);
    color: #f8fafc;
        padding: 12px 16px;
          border-radius: 22px;
            display: inline-block;
              max-width: 72%;
              }

.message.own .message-bubble {
  background: linear-gradient(135deg, #4338ca, #7c3aed);
    margin-left: auto;
    }

.message.own {
  text-align: right;
  }

.message {
  margin-bottom: 16px;
  }

/* Stats section */
.stats-section {
  padding: 80px 0;
    background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
      color: #f8fafc;
        }

.stat-item {
  text-align: center;
    margin-bottom: 28px;
    }

.stat-number {
  font-size: 48px !important;
    font-weight: 800;
      margin-bottom: 10px;
      }

.stat-label {
  font-size: 20px;
    opacity: 0.92;
    }

/* Footer */
.footer {
  background: #111827;
      color: #cbd5e1;
          padding: 60px 0 30px;
          }

.footer p,
.footer h5 {
  color: #e2e8f0;
    }

.social-links a {
  color: #cbd5e1;
      font-size: 22px;
        margin: 0 12px;
          transition: transform 0.2s ease, color 0.2s ease;
          }

.social-links a:hover {
  color: #a78bfa;
      transform: translateY(-2px);
      }

.section-title {
  font-size: 32px;
    font-weight: 800;
      text-align: center;
        margin-bottom: 50px;
          position: relative;
            color: #111827;
              }

.section-title::after {
  content: '';
    position: absolute;
      bottom: -14px;
        left: 50%;
          transform: translateX(-50%);
            width: 100px;
              height: 4px;
                background: linear-gradient(135deg, #4338ca, #7c3aed);
                  border-radius: 999px;
                  }

.pulse {
  animation: pulse 2.5s infinite;
  }

@keyframes pulse {
  0% {
      box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.35);
        }
          70% {
              box-shadow: 0 0 0 16px rgba(124, 58, 237, 0);
                }
                  100% {
                      box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
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
    opacity: 0.12;
      animation: float 18s ease-in-out infinite;
      }

.shape:nth-child(1) {
  top: 12%;
    left: 10%;
      width: 120px;
        height: 120px;
          background: rgba(255, 255, 255, 0.22);
            border-radius: 50%;
            }

.shape:nth-child(2) {
  top: 18%;
    right: 8%;
      width: 140px;
        height: 140px;
          background: rgba(255, 255, 255, 0.18);
            border-radius: 50%;
            }

.shape:nth-child(3) {
  bottom: 14%;
    left: 20%;
      width: 90px;
        height: 90px;
          background: rgba(255, 255, 255, 0.16);
            border-radius: 50%;
            }

@media (max-width: 768px) {
  .hero-title {
      font-size: 2.8rem;
        }

  .hero-subtitle {
      font-size: 20px;
        }

  .hero-description {
      font-size: 17px;
        }

  .btn-primary-custom,
    .btn-outline-custom {
        font-size: 16px !important;
            padding: 12px 28px !important;
                width: 100%;
                  }

  .section-title {
      font-size: 28px;
        }

  .feature-icon {
      font-size: 2.3rem;
        }

  .stat-number {
      font-size: 38px;
        }

  .hero-content {
      padding: 120px 0 80px;
        }
        }

.modal-content {
  border-radius: 20px;
    border: none;
    }

.modal-header {
  background: linear-gradient(135deg, #4338ca, #7c3aed);
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
  background: linear-gradient(135deg, #4338ca, #7c3aed);
    color: white;
      border-color: transparent;
      }

.nav-tabs .nav-link:hover {
  border-color: #4338ca;
    }

.list-group-item {
  border-left: 4px solid transparent;
    transition: all 0.3s ease;
    }

.list-group-item:hover {
  border-left-color: #4338ca;
      background-color: #f8f9fa;
        }

.form-control:focus {
  border-color: #4338ca;
      box-shadow: 0 0 0 0.2rem rgba(67, 56, 202, 0.25);
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
  background: #7c3aed;
      border-radius: 4px;
      }

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a855f7;
    }

.custom-modal {
  background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px);
      border-radius: 18px;
        overflow: hidden;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.45);
          }

.custom-modal-header {
  background: linear-gradient(135deg, #4338ca, #7c3aed);
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
      color: #7c3aed;
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
  background: rgba(124, 58, 237, 0.09);
  }

.user-badge {
  border-radius: 12px;
    font-weight: 600;
    }

.highlight-sub {
  font-weight: 600;
    margin-bottom: 12px;
      color: #4338ca;
        }

.about-section {
  padding: 80px 0;
    background: linear-gradient(135deg, #f8fafc, #eef2ff);
      text-align: center;
      }

.about-section .section-title {
  font-size: 36px;
    font-weight: 800;
      margin-bottom: 20px;
        color: #111827;
          }

.about-text {
  font-size: 19px;
    color: #334155;
        max-width: 820px;
          margin: 0 auto;
            line-height: 1.75;
            }

.testimonials-section {
  padding: 80px 0;
    background: #ffffff;
      }

.testimonials-section .section-title {
  font-size: 36px;
    font-weight: 800;
      margin-bottom: 48px;
      }

.testimonial-card {
  border: none;
    background: #f8fafc;
        border-radius: 22px;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
            transition: transform 0.3s ease;
            }

.testimonial-card:hover {
  transform: translateY(-8px);
  }

.testimonial-text {
  font-size: 18px;
    color: #1f2937;
        font-style: italic;
          margin-bottom: 16px;
          }
          </style>

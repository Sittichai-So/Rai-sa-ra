<template>
  <div class="community-chat-app">
    <button class="mobile-menu-toggle" :class="{ open: sidebarOpen }" @click="toggleSidebar">
      <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'" />
    </button>

    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar" />

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="workspace-info">
          <div class="workspace-icon">
            <i class="fas fa-comments" />
          </div>
          <div class="workspace-details">
            <h4>Community</h4>
            <span class="workspace-members">{{ myDisplayName }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="section">
          <div class="section-header">
            <button class="section-toggle" type="button" @click="toggleRoomsSection">
              <i class="fas fa-chevron-down" :class="{ collapsed: roomsCollapsed }" />
              <h6>ช่องแชทกลุ่มของฉัน</h6>
            </button>
            <button class="add-channel-btn" @click="showCreateRoom = true">
              <i class="fas fa-plus" />
            </button>
            <button class="add-channel-btn" style="margin-left: 8px;" @click="toggleRoomSearchBox">
              <i class="fas fa-search" />
            </button>
          </div>
          <div v-show="!roomsCollapsed">
            <div v-if="joinedRooms.length > 6 || showRoomSearchBox" class="sidebar-search">
              <i class="fas fa-search" />
              <input ref="roomSearchInput" v-model="roomSearch" type="text" placeholder="ค้นหาห้อง...">
            </div>
            <div v-if="roomSearch.trim() && !filteredJoinedRooms.length" class="friends-empty">
              ไม่พบห้องที่ค้นหา
            </div>
            <div class="channels-list">
              <div
                v-for="room in filteredJoinedRooms"
                :key="room._id"
                class="channel-item"
                :class="{ active: activeRoomId === room._id }"
              >
                <div
                  class="channel-main"
                  @click="goToRoom(room._id)"
                >
                  <span class="channel-prefix">#</span>

                  <span class="channel-name">
                    {{ room.name }}
                  </span>

                  <div
                    v-if="room.unreadCount"
                    class="unread-badge"
                  >
                    {{ room.unreadCount }}
                  </div>
                </div>

                <button
                  class="channel-menu-btn"
                  type="button"
                  aria-label="จัดการห้อง"
                  @click.stop="openRoomMenu(room, $event)"
                >
                  <i class="fas fa-ellipsis-v" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <button class="section-toggle" type="button" @click="toggleFriendsSection">
              <i class="fas fa-chevron-down" :class="{ collapsed: friendsCollapsed }" />
              <h6>
                เพื่อนของฉัน
                <span v-if="friendRequests.length" class="hdr-badge">{{ friendRequests.length }}</span>
              </h6>
            </button>
            <div class="section-header-actions">
              <button class="add-channel-btn" style="margin-left: 8px;" @click="toggleFriendSearchBox">
                <i class="fas fa-search" />
              </button>
              <button class="add-channel-btn" title="ผู้ใช้ที่ถูกบล็อก" @click="openBlockedList">
                <i class="fas fa-user-slash" />
              </button>
              <button class="add-channel-btn" title="เพิ่มเพื่อน" @click="showAddFriend = true">
                <i class="fas fa-user-plus" />
              </button>
            </div>
          </div>

          <div v-show="!friendsCollapsed">
            <div v-if="friendRequests.length > 0" class="friend-requests">
              <div
                v-for="request in friendRequests"
                :key="request._id"
                class="friend-request"
              >
                <div class="user-avatar">
                  <img v-if="request.avatar" :src="request.avatar" :alt="request.userName">
                  <div v-else class="avatar-placeholder">
                    {{ request.userInitials }}
                  </div>
                </div>
                <div class="request-info">
                  <span class="user-name">{{ request.userName }}</span>
                  <div class="request-actions">
                    <button class="btn-accept" @click="acceptFriend(request._id)">
                      <i class="fas fa-check" />
                    </button>
                    <button class="btn-reject" @click="rejectFriend(request._id)">
                      <i class="fas fa-times" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="allFriends.length > 8 || showFriendSearchBox" class="sidebar-search">
              <i class="fas fa-search" />
              <input ref="friendSearchInput" v-model="friendSearch" type="text" placeholder="ค้นหาเพื่อน...">
            </div>

            <div class="friends-list">
              <div v-if="!allFriends.length" class="friends-empty">
                ยังไม่มีเพื่อน — กด <i class="fas fa-user-plus" /> เพื่อค้นหาและเพิ่มเพื่อน
              </div>
              <div v-else-if="!filteredFriendsList.length" class="friends-empty">
                ไม่พบเพื่อนที่ค้นหา
              </div>
              <div
                v-for="friend in filteredFriendsList"
                :key="friend.friendId"
                class="friend-item"
                :class="friend.isOnline ? 'online' : 'offline'"
                @click="openDirectMessage(friend)"
              >
                <div class="user-avatar">
                  <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.displayName">
                  <div v-else class="avatar-placeholder">
                    {{ getInitials(friend.displayName) }}
                  </div>
                  <div class="status-indicator" :class="friend.isOnline ? 'online' : 'offline'" />
                </div>
                <div class="friend-info">
                  <span class="friend-name">{{ friend.displayName }}</span>
                  <span v-if="friend.lastMessage" class="last-message">{{ friend.lastMessage }}</span>
                </div>
                <div v-if="friend.unreadCount" class="unread-badge">
                  {{ friend.unreadCount }}
                </div>
                <div class="friend-actions">
                  <button
                    class="friend-menu-btn"
                    type="button"
                    aria-label="ตัวเลือก"
                    @click.stop="openFriendMenu(friend, $event)"
                  >
                    <i class="fas fa-ellipsis-v" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h6>มินิเกม</h6>
          </div>
          <div style="padding: 0 12px;">
            <nuxt-link to="/game" class="game-sidebar-btn">
              <span class="game-btn-icon">☣</span>
              <div class="game-btn-text">
                <span class="game-btn-title">Zombie Strike</span>
                <span class="game-btn-sub">Multiplayer Co-op</span>
              </div>
              <i class="fas fa-chevron-right game-btn-arrow" />
            </nuxt-link>
          </div>
        </div>
      </div>

      <div class="user-profile">
        <div class="user-info">
          <div class="user-avatar">
            <img
              v-if="myAvatar && !avatarBroken"
              :src="myAvatar"
              :alt="userName"
              @error="avatarBroken = true"
            >
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
            <div class="status-indicator online" />
          </div>
          <div class="user-details">
            <span class="user-name">{{ myDisplayName }}</span>
            <span class="user-status">ออนไลน์</span>
          </div>
        </div>
        <div class="user-actions">
          <button
            v-if="$store.getters.isAdmin"
            class="user-action-btn user-action-admin"
            title="ศูนย์จัดการระบบ"
            @click="$router.push('/admin')"
          >
            <i class="fas fa-shield-halved" />
          </button>
          <button class="user-action-btn" @click="setting">
            <i class="fas fa-cog" />
          </button>
          <button class="user-action-btn" @click="logout">
            <i class="fas fa-sign-out-alt" />
          </button>
        </div>
        <SettingDialog ref="SettingDialog" />
      </div>
    </aside>

    <main class="main-content">
      <div v-if="showVerifyBanner" class="verify-banner">
        <i class="fas fa-envelope" />
        <span class="verify-banner-text">
          อีเมลของคุณยังไม่ได้ยืนยัน — ยืนยันเพื่อความปลอดภัยของบัญชี
        </span>
        <button class="verify-banner-btn" :disabled="resendingVerify" @click="resendVerifyEmail">
          {{ resendingVerify ? 'กำลังส่ง...' : 'ส่งอีเมลยืนยันอีกครั้ง' }}
        </button>
        <button class="verify-banner-close" aria-label="ปิด" @click="verifyBannerDismissed = true">
          <i class="fas fa-times" />
        </button>
      </div>

      <header class="main-header">
        <div class="header-left">
          <span class="eyebrow">Community</span>
          <h1>ชุมชนสำหรับคุณ</h1>
          <p>เลือกช่องทางที่คุณสนใจเพื่อเริ่มการสนทนา</p>
        </div>
        <div class="header-right">
          <nuxt-link to="/wallet" class="coin-pill" title="กระเป๋าเหรียญ">
            <CoinIcon :size="18" />
            <span>{{ myCoins }}</span>
            <i class="fas fa-plus coin-pill-plus" />
          </nuxt-link>
          <div class="search-container">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาช่องทาง..."
                class="search-input"
              >
            </div>
          </div>
        </div>
      </header>

      <div class="community-hero">
        <div class="community-content">
          <i class="community-icon-large fas fa-comments" />
          <h3 class="community-title">
            Community Chat
          </h3>
          <p class="community-subtitle">
            เลือกห้องแชทที่ตรงกับความสนใจของคุณและเริ่มต้นการสนทนาที่น่าสนใจ
          </p>
        </div>
      </div>

      <div class="categories-filter">
        <div class="filter-tabs">
          <button
            v-for="category in categories"
            :key="category.key"
            class="filter-tab"
            :class="{ 'active': activeCategory === category.key }"
            @click="activeCategory = category.key"
          >
            <i :class="`fas fa-${category.icon}`" />
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="rooms-container">
        <div v-if="filteredUnjoinedRooms.length" class="rooms-grid">
          <div
            v-for="room in filteredUnjoinedRooms"
            :key="room._id"
            class="room-card"
          >
            <div class="room-card-header">
              <div class="room-icon-wrapper">
                <div
                  class="room-icon"
                  :style="{ background: room.iconGradient }"
                >
                  <i :class="`fas fa-${room.icon}`" />
                </div>
              </div>
              <div class="room-meta">
                <h3 class="room-title">
                  {{ room.name }}
                </h3>
                <span class="room-category">{{ room.categoryName }}</span>
              </div>
            </div>

            <div class="room-stats">
              <div class="stat-item">
                <i class="fas fa-users" />
                <span>{{ room.memberCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-comments" />
                <span>{{ room.messageCount || 0 }}</span>
              </div>
              <div class="stat-item status">
                <div class="status-dot" :class="room.status === 'ออนไลน์' && room.isOpen !== false ? 'online' : 'offline'" />
                <span>{{ room.isOpen === false ? 'ปิดใช้งาน' : room.status }}</span>
              </div>
            </div>

            <div class="room-description">
              <p>{{ room.description }}</p>
            </div>

            <div class="room-tags">
              <span
                v-for="tag in room.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="room-actions">
              <button
                v-if="room.status === 'ออนไลน์' && room.isOpen !== false"
                class="join-btn"
                :disabled="joiningRoom === room._id || isUserInRoom(room._id)"
                @click="joinRoom(room._id)"
              >
                <i v-if="joiningRoom === room._id" class="fas fa-spinner fa-spin" />
                <i v-else :class="room.type === 'private' ? 'fas fa-lock' : 'fas fa-sign-in-alt'" />
                {{ joiningRoom === room._id ? 'กำลังเข้าร่วม...' : (room.type === 'private' ? 'เข้าร่วม (Private)' : 'เข้าร่วม') }}
              </button>
              <button v-else class="join-btn disabled" disabled>
                <i class="fas fa-lock" />
                {{ room.isOpen === false ? 'ปิดใช้งานชั่วคราว' : 'ไม่พร้อมใช้งาน' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="fas fa-compass" />
          <p v-if="searchQuery.trim()">
            ไม่พบห้องที่ตรงกับ "{{ searchQuery }}"
          </p>
          <p v-else-if="rooms.length">
            คุณเข้าร่วมทุกห้องในหมวดนี้แล้ว 🎉
          </p>
          <p v-else>
            ยังไม่มีห้องแชทให้เข้าร่วม
          </p>
        </div>
      </div>
    </main>

    <transition name="af-fade">
      <div v-if="showCreateRoom" class="cr-overlay" @click.self="closeCreateRoom">
        <div class="cr-panel" role="dialog" aria-modal="true">
          <header class="cr-header">
            <h3 class="cr-title">
              <i class="fas fa-plus-circle" /> สร้างห้องแชทใหม่
            </h3>
            <button class="af-close" type="button" aria-label="ปิด" @click="closeCreateRoom">
              <i class="fas fa-times" />
            </button>
          </header>

          <form class="cr-body" @submit.prevent="createRoom">
            <div class="cr-field">
              <label for="roomName">ชื่อห้อง</label>
              <input
                id="roomName"
                v-model="newRoom.name"
                type="text"
                class="cr-input"
                placeholder="เช่น คุยเรื่องเกม, ห้องรวมพล..."
                maxlength="60"
              >
            </div>

            <div class="cr-field">
              <label for="roomCategory">หมวดหมู่</label>
              <select id="roomCategory" v-model="newRoom.category" class="cr-input">
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.text }}
                </option>
              </select>
            </div>

            <div class="cr-field">
              <label>ประเภทห้อง</label>
              <div class="cr-type-grid">
                <button
                  type="button"
                  class="cr-type"
                  :class="{ active: newRoom.type === 'public' }"
                  @click="newRoom.type = 'public'"
                >
                  <i class="fas fa-globe-asia" />
                  <span class="cr-type-name">สาธารณะ</span>
                  <span class="cr-type-desc">ใครก็เข้าได้</span>
                </button>
                <button
                  type="button"
                  class="cr-type"
                  :class="{ active: newRoom.type === 'private' }"
                  @click="newRoom.type = 'private'"
                >
                  <i class="fas fa-lock" />
                  <span class="cr-type-name">ส่วนตัว</span>
                  <span class="cr-type-desc">
                    <template v-if="privateRoomCost > 0">
                      <CoinIcon :size="13" /> {{ privateRoomCost }} เหรียญ
                    </template>
                    <template v-else>ต้องมีรหัสผ่าน</template>
                  </span>
                </button>
              </div>
            </div>

            <div v-if="newRoom.type === 'private'" class="cr-field">
              <label for="roomPassword">รหัสผ่านห้อง</label>
              <input
                id="roomPassword"
                v-model="newRoom.password"
                type="password"
                class="cr-input"
                placeholder="ตั้งรหัสผ่านให้สมาชิกใช้เข้าห้อง"
              >
              <small v-if="privateRoomCost > 0" class="cr-hint">
                <CoinIcon :size="12" /> สร้างห้องส่วนตัวใช้ {{ privateRoomCost }} เหรียญ (คุณมี {{ myCoins }})
              </small>
            </div>

            <div class="cr-field">
              <label for="roomTags">แท็ก <span class="cr-hint">(สูงสุด {{ limit }})</span></label>
              <div class="cr-tags">
                <span v-for="(tag, i) in newRoom.tags" :key="i" class="cr-tag">
                  {{ tag }}
                  <button type="button" aria-label="ลบแท็ก" @click="removeTag(i)"><i class="fas fa-times" /></button>
                </span>
                <input
                  v-if="newRoom.tags.length < limit"
                  id="roomTags"
                  v-model="tagInput"
                  type="text"
                  class="cr-tag-input"
                  placeholder="พิมพ์แล้วกด Enter"
                  @keydown.enter.prevent="addTag"
                  @keydown.188.prevent="addTag"
                >
              </div>
            </div>

            <div class="cr-field">
              <label for="roomDescription">คำอธิบาย</label>
              <textarea
                id="roomDescription"
                v-model="newRoom.description"
                class="cr-input"
                rows="3"
                maxlength="300"
                placeholder="ห้องนี้เกี่ยวกับอะไร..."
              />
            </div>

            <div class="cr-field">
              <label>สีไอคอนห้อง</label>
              <div class="cr-swatches">
                <button
                  v-for="(gradient, index) in gradients"
                  :key="index"
                  type="button"
                  class="cr-swatch"
                  :class="{ active: newRoom.iconGradient === gradient }"
                  :style="{ background: gradient }"
                  :aria-label="'สีที่ ' + (index + 1)"
                  @click="newRoom.iconGradient = newRoom.iconGradient === gradient ? '' : gradient"
                />
              </div>
              <small class="cr-hint">ปล่อยว่างให้ระบบเลือกสีตามหมวดหมู่ให้อัตโนมัติ</small>
            </div>
          </form>

          <footer class="cr-footer">
            <button type="button" class="cr-btn cr-btn-ghost" @click="closeCreateRoom">
              ยกเลิก
            </button>
            <button
              type="button"
              class="cr-btn cr-btn-primary"
              :disabled="creatingRoom || !newRoom.name.trim()"
              @click="createRoom"
            >
              <i v-if="creatingRoom" class="fas fa-spinner fa-spin" />
              {{ creatingRoom ? 'กำลังสร้าง...' : 'สร้างห้อง' }}
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <transition name="af-fade">
      <div v-if="showAddFriend" class="af-overlay" @click.self="closeModal">
        <div class="af-panel" role="dialog" aria-modal="true">
          <header class="af-header">
            <h3 class="af-title">
              <i class="fas fa-user-plus" /> เพิ่มเพื่อน
            </h3>
            <button class="af-close" type="button" aria-label="ปิด" @click="closeModal">
              <i class="fas fa-times" />
            </button>
          </header>

          <div class="af-tabs">
            <button
              type="button"
              class="af-tab"
              :class="{ active: afTab === 'search' }"
              @click="afTab = 'search'"
            >
              <i class="fas fa-search" /> ค้นหา
            </button>
            <button
              type="button"
              class="af-tab"
              :class="{ active: afTab === 'sent' }"
              @click="switchToSentTab"
            >
              <i class="fas fa-paper-plane" /> คำขอที่ส่ง
              <span v-if="sentRequests.length" class="af-tab-badge">{{ sentRequests.length }}</span>
            </button>
          </div>

          <template v-if="afTab === 'search'">
            <div class="af-search-row">
              <div class="af-search-box">
                <i class="fas fa-search af-search-icon" />
                <input
                  ref="afSearch"
                  v-model="userSearchQuery"
                  type="text"
                  placeholder="ชื่อผู้ใช้ หรืออีเมล..."
                  @keyup.enter="searchUsers"
                >
                <button
                  v-if="userSearchQuery"
                  class="af-clear"
                  type="button"
                  aria-label="ล้าง"
                  @click="clearSearchInput"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
              <button
                class="af-search-btn"
                type="button"
                :disabled="!userSearchQuery.trim() || isSearching"
                @click="searchUsers"
              >
                <i v-if="isSearching" class="fas fa-spinner fa-spin" />
                <i v-else class="fas fa-search" />
                <span>ค้นหา</span>
              </button>
            </div>

            <div class="af-body">
              <div v-if="isSearching" class="af-state">
                <div class="spinner" />
                <span>กำลังค้นหา...</span>
              </div>

              <div v-else-if="searchResults.length > 0" class="search-results">
                <div
                  v-for="u in searchResults"
                  :key="u._id"
                  class="user-result"
                >
                  <div class="user-avatar">
                    <img v-if="u.avatar" :src="u.avatar" :alt="u.displayName">
                    <div v-else class="avatar-placeholder">
                      {{ u.initials }}
                    </div>
                    <span v-if="u.isOnline" class="user-online-dot" />
                  </div>
                  <div class="user-info">
                    <h4>{{ u.displayName }}</h4>
                    <p>{{ u.email || ('@' + u.username) }}</p>
                  </div>
                  <button
                    type="button"
                    class="friend-add-btn"
                    :class="friendBtn(u).cls"
                    :disabled="friendBtn(u).disabled || sendingRequest === u._id"
                    @click="handleFriendAction(u)"
                  >
                    <i v-if="sendingRequest === u._id" class="fas fa-spinner fa-spin" />
                    <i v-else :class="friendBtn(u).icon" />
                    <span>{{ friendBtn(u).text }}</span>
                  </button>
                </div>
              </div>

              <div v-else-if="hasSearched" class="af-state">
                <i class="fas fa-user-slash" />
                <p>ไม่พบผู้ใช้ "{{ userSearchQuery }}"</p>
              </div>

              <div v-else class="af-state">
                <i class="fas fa-user-friends" />
                <p>พิมพ์ชื่อผู้ใช้หรืออีเมล แล้วกดค้นหา</p>
              </div>
            </div>
          </template>

          <div v-else class="af-body">
            <div v-if="loadingSent" class="af-state">
              <div class="spinner" />
              <span>กำลังโหลด...</span>
            </div>
            <div v-else-if="!sentRequests.length" class="af-state">
              <i class="fas fa-paper-plane" />
              <p>ยังไม่มีคำขอเป็นเพื่อนที่ส่งออกไป</p>
            </div>
            <div v-else class="search-results">
              <div
                v-for="r in sentRequests"
                :key="r._id"
                class="user-result"
              >
                <div class="user-avatar">
                  <img v-if="r.avatar" :src="r.avatar" :alt="r.displayName">
                  <div v-else class="avatar-placeholder">
                    {{ r.initials }}
                  </div>
                </div>
                <div class="user-info">
                  <h4>{{ r.displayName }}</h4>
                  <p>{{ r.email || ('@' + r.username) }}</p>
                </div>
                <button
                  type="button"
                  class="friend-add-btn is-cancel"
                  :disabled="cancellingRequest === r._id"
                  @click="cancelSentRequest(r)"
                >
                  <i v-if="cancellingRequest === r._id" class="fas fa-spinner fa-spin" />
                  <i v-else class="fas fa-times" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="af-fade">
      <div v-if="showProfileModal" class="af-overlay" @click.self="closeProfile">
        <div class="pf-panel" role="dialog" aria-modal="true">
          <button class="pf-close" type="button" aria-label="ปิด" @click="closeProfile">
            <i class="fas fa-times" />
          </button>

          <div class="pf-cover" />

          <div class="pf-avatar-wrap">
            <img
              v-if="pfAvatar"
              :src="pfAvatar"
              :alt="pfName"
              class="pf-avatar"
              @error="profileData && (profileData.avatar = null)"
            >
            <div v-else class="pf-avatar pf-avatar-fallback">
              {{ getInitials(pfName) }}
            </div>
            <span class="pf-status-dot" :class="pfOnline ? 'online' : 'offline'" />
          </div>

          <div class="pf-body">
            <h3 class="pf-name">
              {{ pfName }}
            </h3>
            <span class="pf-status-text" :class="pfOnline ? 'online' : 'offline'">
              {{ pfOnline ? 'ออนไลน์' : 'ออฟไลน์ · ' + fmtLastActive((profileData && profileData.lastActive) || (profileFriend && profileFriend.lastActive)) }}
            </span>

            <div v-if="profileLoading" class="pf-loading">
              <i class="fas fa-spinner fa-spin" /> กำลังโหลด...
            </div>

            <template v-else>
              <p v-if="pfBio" class="pf-bio">
                {{ pfBio }}
              </p>
              <p v-else class="pf-bio pf-bio-empty">
                ยังไม่มีคำอธิบายตัวเอง
              </p>

              <div class="pf-rows">
                <div v-if="pfUsername" class="pf-row">
                  <i class="fas fa-at" />
                  <span>{{ pfUsername }}</span>
                </div>
                <div v-if="pfEmail" class="pf-row">
                  <i class="fas fa-envelope" />
                  <span>{{ pfEmail }}</span>
                </div>
                <div v-if="profileData && profileData.friendsSince" class="pf-row">
                  <i class="fas fa-user-check" />
                  <span>เป็นเพื่อนกันตั้งแต่ {{ fmtProfileDate(profileData.friendsSince) }}</span>
                </div>
                <div v-if="profileData && profileData.memberSince" class="pf-row">
                  <i class="fas fa-calendar-day" />
                  <span>เข้าร่วมเมื่อ {{ fmtProfileDate(profileData.memberSince) }}</span>
                </div>
              </div>
            </template>
          </div>

          <div class="pf-actions">
            <button type="button" class="pf-btn pf-btn-primary" @click="profileMessage">
              <i class="fas fa-comment" /> ส่งข้อความ
            </button>
            <button type="button" class="pf-btn pf-btn-danger" @click="profileBlock">
              <i class="fas fa-user-slash" /> บล็อก
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="af-fade">
      <div v-if="showJoinPasswordModal" class="cr-overlay" @click.self="showJoinPasswordModal = false">
        <div class="cr-panel cr-panel-sm" role="dialog" aria-modal="true">
          <header class="cr-header">
            <h3 class="cr-title">
              <i class="fas fa-lock" /> เข้าร่วมห้องส่วนตัว
            </h3>
            <button class="af-close" type="button" aria-label="ปิด" @click="showJoinPasswordModal = false">
              <i class="fas fa-times" />
            </button>
          </header>

          <form class="cr-body" @submit.prevent="confirmJoinPrivateRoom">
            <div class="cr-field">
              <label for="joinPassword">รหัสผ่านห้อง</label>
              <input
                id="joinPassword"
                v-model="joinPassword"
                type="password"
                class="cr-input"
                placeholder="กรอกรหัสผ่านที่ได้รับจากเจ้าของห้อง"
              >
            </div>
          </form>

          <footer class="cr-footer">
            <button type="button" class="cr-btn cr-btn-ghost" @click="showJoinPasswordModal = false">
              ยกเลิก
            </button>
            <button type="button" class="cr-btn cr-btn-primary" @click="confirmJoinPrivateRoom">
              เข้าร่วมห้อง
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <DirectMessageModal
      ref="dmModal"
      :friend="selectedFriend"
      :current-user-id="user?._id"
      :support-mode="dmSupportMode"
      :my-name="myDisplayName"
      :my-avatar="myAvatar"
      @read="onDmRead"
      @sent="onDmSent"
    />

    <div
      v-if="friendMenu.open"
      class="friend-menu-backdrop"
      @click="closeFriendMenu"
      @contextmenu.prevent="closeFriendMenu"
    >
      <div
        class="friend-menu"
        :style="friendMenuStyle"
        @click.stop
      >
        <button type="button" @click="fmProfile">
          <i class="fas fa-user" /> ดูโปรไฟล์
        </button>
        <button type="button" @click="fmMessage">
          <i class="fas fa-comments" /> ส่งข้อความ
        </button>
        <button type="button" class="danger" @click="fmRemove">
          <i class="fas fa-user-minus" /> ลบเพื่อน
        </button>
        <button type="button" class="danger" @click="fmBlock">
          <i class="fas fa-user-slash" /> บล็อก
        </button>
      </div>
    </div>

    <div
      v-if="roomMenu.open"
      class="friend-menu-backdrop"
      @click="closeRoomMenu"
      @contextmenu.prevent="closeRoomMenu"
    >
      <div
        class="friend-menu"
        :style="roomMenuStyle"
        @click.stop
      >
        <button type="button" @click="rmOpen">
          <i class="fas fa-comments" /> ไปที่ห้องแชท
        </button>
        <button type="button" class="danger" @click="rmLeave">
          <i class="fas fa-sign-out-alt" /> ออกจากห้อง
        </button>
      </div>
    </div>

    <div v-if="dmPanelOpen" class="dm-launcher-backdrop" @click="dmPanelOpen = false" />

    <transition name="dm-launcher">
      <div v-if="dmPanelOpen" class="dm-launcher-panel" role="dialog" aria-label="ข้อความส่วนตัว">
        <header class="dm-launcher-head">
          <h3>ข้อความ</h3>
          <button class="dm-launcher-close" type="button" aria-label="ปิด" @click="dmPanelOpen = false">
            <i class="fas fa-times" />
          </button>
        </header>
        <div class="dm-launcher-search">
          <i class="fas fa-search" />
          <input v-model="dmSearch" type="text" placeholder="ค้นหาแชท...">
        </div>
        <div class="dm-launcher-list">
          <button
            v-if="supportContact && !dmSearch.trim()"
            type="button"
            class="dm-row dm-row-support"
            :class="{ unread: supportUnreadCount > 0 }"
            @click="openSupportChat"
          >
            <div class="dm-avatar dm-avatar-support">
              <i class="fas fa-headset" />
            </div>
            <div class="dm-info">
              <span class="dm-name">ฝ่ายช่วยเหลือ (แอดมิน)</span>
              <span class="dm-last-message">สอบถาม · แจ้งปัญหาการใช้งาน</span>
            </div>
            <span v-if="supportUnreadCount" class="dm-count">{{ supportUnreadCount > 99 ? '99+' : supportUnreadCount }}</span>
          </button>

          <div v-if="filteredDMs.length === 0" class="dm-launcher-empty">
            <i class="fas fa-comments" />
            <span>{{ dmSearch.trim() ? 'ไม่พบแชทที่ค้นหา' : 'ยังไม่มีข้อความส่วนตัว' }}</span>
            <small v-if="!dmSearch.trim()">แตะชื่อเพื่อนในแถบข้างเพื่อเริ่มแชท</small>
          </div>
          <button
            v-for="dm in filteredDMs"
            :key="dm.friendId"
            type="button"
            class="dm-row"
            :class="{ unread: dm.unreadCount > 0 }"
            @click="openDmFromPanel(dm)"
          >
            <div class="dm-avatar">
              <img v-if="dm.avatar" :src="dm.avatar" :alt="dm.displayName">
              <div v-else class="avatar-placeholder">
                {{ getInitials(dm.displayName) }}
              </div>
              <span v-if="dm.status === 'online'" class="dm-online-dot" />
            </div>
            <div class="dm-info">
              <span class="dm-name">{{ dm.displayName }}</span>
              <span class="dm-last-message">
                <i v-if="dm.lastFromMe" class="fas fa-reply dm-you-icon" />{{ dm.lastMessage || 'เริ่มการสนทนา...' }}
              </span>
            </div>
            <span v-if="dm.unreadCount" class="dm-count">
              {{ dm.unreadCount > 99 ? '99+' : dm.unreadCount }}
            </span>
          </button>
        </div>
      </div>
    </transition>

    <button
      class="dm-fab"
      :class="{ open: dmPanelOpen, pulse: dmFabPulse && !dmPanelOpen }"
      type="button"
      aria-label="ข้อความส่วนตัว"
      @click="toggleDmPanel"
    >
      <i :class="dmPanelOpen ? 'fas fa-times' : 'fas fa-comment-dots'" />
      <span v-if="dmFabUnread && !dmPanelOpen" class="dm-fab-badge">
        {{ dmFabUnread > 99 ? '99+' : dmFabUnread }}
      </span>
    </button>
  </div>
</template>

<script>
import SettingDialog from '~/components/setting.vue'
import DirectMessageModal from '~/components/DirectMessageModal.vue'

export default {
  name: 'CommunityChat',
  components: { SettingDialog, DirectMessageModal },
  middleware: 'middlewareAuth',
  data () {
    const storedUser = localStorage.getItem('userData')
    const parsedUser = storedUser ? JSON.parse(storedUser) : null
    return {
      loginData: null,
      isLogin: false,
      token: null,
      user: parsedUser,
      userName: parsedUser ? parsedUser.fullname : 'Guest',
      searchQuery: '',
      activeCategory: 'all',
      activeRoomId: null,
      joiningRoom: null,
      sidebarCollapsed: false,
      showCreateRoom: false,
      showAddFriend: false,
      searchUser: '',
      categories: [],
      rooms: [],
      profile: [],
      friendRequests: [],
      friends: [],
      onlineFriends: [],
      offlineFriends: [],
      roomSearch: '',
      friendSearch: '',
      showRoomSearchBox: false,
      showFriendSearchBox: false,
      roomsCollapsed: localStorage.getItem('sidebarRoomsCollapsed') === '1',
      friendsCollapsed: localStorage.getItem('sidebarFriendsCollapsed') === '1',
      userSearchQuery: '',
      searchResults: [],
      isSearching: false,
      hasSearched: false,
      sendingRequest: null,
      afTab: 'search',
      sentRequests: [],
      loadingSent: false,
      cancellingRequest: null,
      friendMenu: { open: false, friend: null, x: 0, y: 0 },
      roomMenu: { open: false, room: null, x: 0, y: 0 },
      dmPanelOpen: false,
      dmSearch: '',
      dmFabPulse: false,
      dmSupportMode: false,
      supportContact: null,
      supportUnreadCount: 0,
      showProfileModal: false,
      profileFriend: null,
      profileData: null,
      profileLoading: false,
      showJoinPasswordModal: false,
      limit: 5,
      newRoom: { name: '', category: 'gaming', description: '', type: 'public', password: '', tags: [], iconGradient: '' },
      gradients: [
        'linear-gradient(135deg, #FF5A45, #FF3B30)',
        'linear-gradient(135deg, #FFC94D, #FF9F1C)',
        'linear-gradient(135deg, #7C6CF5, #5B4CDB)',
        'linear-gradient(135deg, #37C871, #1E9E56)',
        'linear-gradient(135deg, #4DB8FF, #2E86DE)',
        'linear-gradient(135deg, #9A94A6, #6B6577)'
      ],
      joinPassword: '',
      sidebarOpen: false,
      joinRoomIdPending: null,
      selectedFriend: null,
      dmConversations: [],
      idleTimer: null,
      verifyBannerDismissed: false,
      resendingVerify: false,
      avatarBroken: false,
      tagInput: '',
      creatingRoom: false,
      privateRoomCost: 0
    }
  },
  computed: {
    userStatus () {
      const user = JSON.parse(localStorage.getItem('userData') || '{}')
      return user.status || 'offline'
    },
    showVerifyBanner () {
      if (this.verifyBannerDismissed) {
        return false
      }
      const u = this.user || {}
      return u.emailVerified === false
    },
    joinedRooms () {
      return this.rooms.filter(room => this.isUserInRoom(room._id))
    },
    filteredJoinedRooms () {
      const term = this.roomSearch.trim().toLowerCase()
      if (!term) { return this.joinedRooms }
      return this.joinedRooms.filter(r => (r.name || '').toLowerCase().includes(term))
    },
    unjoinedRooms () {
      return this.rooms.filter(room => !this.isUserInRoom(room._id))
    },
    userInitials () {
      const name = this.myDisplayName || 'U'
      return String(name)
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
    },
    myDisplayName () {
      const u = this.user || {}
      return (this.profile && this.profile.displayName) ||
        u.displayName || u.fullname || u.username || 'ผู้ใช้'
    },
    myAvatar () {
      const src =
        (this.profile && this.profile.avatar) ||
        (this.$store.state.user && this.$store.state.user.avatar) ||
        (this.user && this.user.avatar) ||
        null
      return this.resolveAsset(src)
    },
    pfName () {
      const d = this.profileData
      const f = this.profileFriend
      return (d && (d.displayName || d.fullname)) || (f && (f.displayName || f.fullname)) || 'โปรไฟล์เพื่อน'
    },
    pfAvatar () {
      const raw = (this.profileData && this.profileData.avatar) || (this.profileFriend && this.profileFriend.avatar) || null
      return raw ? this.resolveAsset(raw) : null
    },
    pfOnline () {
      const d = this.profileData
      const f = this.profileFriend
      if (d && typeof d.isOnline === 'boolean') { return d.isOnline }
      return !!(f && f.isOnline)
    },
    pfBio () {
      return (this.profileData && this.profileData.bio) || ''
    },
    pfUsername () {
      return (this.profileData && this.profileData.username) || (this.profileFriend && this.profileFriend.username) || ''
    },
    pfEmail () {
      return (this.profileData && this.profileData.email) || (this.profileFriend && this.profileFriend.email) || ''
    },
    myCoins () {
      if (this.profile && typeof this.profile.coins === 'number') { return this.profile.coins }
      const u = this.$store.state.user || this.user || {}
      return typeof u.coins === 'number' ? u.coins : 0
    },
    categoryOptions () {
      return this.categories
        .filter(cat => cat.key !== 'all')
        .map(cat => ({
          value: cat.key,
          text: cat.name
        }))
    },
    filteredUnjoinedRooms () {
      return this.unjoinedRooms.filter((room) => {
        if (this.activeCategory !== 'all' && room.category !== this.activeCategory) { return false }
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase()
          return (
            room.name.toLowerCase().includes(q) ||
            room.description.toLowerCase().includes(q) ||
            room.tags?.some(tag => tag.toLowerCase().includes(q))
          )
        }
        return true
      })
    },
    activeDMs () {
      return this.dmConversations
    },
    filteredDMs () {
      const q = this.dmSearch.trim().toLowerCase()
      if (!q) { return this.activeDMs }
      return this.activeDMs.filter(dm =>
        (dm.displayName || '').toLowerCase().includes(q) ||
        (dm.lastMessage || '').toLowerCase().includes(q)
      )
    },
    dmFabUnread () {
      return this.totalUnreadDM + this.supportUnreadCount
    },
    allFriends () {
      return [...this.onlineFriends, ...this.offlineFriends]
    },
    filteredFriendsList () {
      const term = this.friendSearch.trim().toLowerCase()
      if (!term) { return this.allFriends }
      return this.allFriends.filter(f => (f.displayName || '').toLowerCase().includes(term))
    },
    totalUnreadDM () {
      return this.dmConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    },
    friendMenuStyle () {
      const W = 180
      const H = 148
      let left = this.friendMenu.x - W
      let top = this.friendMenu.y
      if (typeof window !== 'undefined') {
        if (left < 8) { left = 8 }
        if (top + H > window.innerHeight - 8) { top = window.innerHeight - H - 8 }
        if (top < 8) { top = 8 }
      }
      return { top: `max(${top}px, env(safe-area-inset-top))`, left: `max(${left}px, env(safe-area-inset-left))` }
    },
    roomMenuStyle () {
      const W = 190
      const H = 104
      let left = this.roomMenu.x - W
      let top = this.roomMenu.y
      if (typeof window !== 'undefined') {
        if (left < 8) { left = 8 }
        if (top + H > window.innerHeight - 8) { top = window.innerHeight - H - 8 }
        if (top < 8) { top = 8 }
      }
      return { top: `max(${top}px, env(safe-area-inset-top))`, left: `max(${left}px, env(safe-area-inset-left))` }
    }
  },
  watch: {
    showAddFriend (open) {
      document.body.style.overflow = open ? 'hidden' : ''
      if (open) {
        this.$nextTick(() => this.$refs.afSearch && this.$refs.afSearch.focus())
      }
    },
    showCreateRoom (open) {
      document.body.style.overflow = open ? 'hidden' : ''
    },
    showJoinPasswordModal (open) {
      document.body.style.overflow = open ? 'hidden' : ''
    },
    myAvatar () {
      this.avatarBroken = false
    }
  },
  async mounted () {
    document.documentElement.style.setProperty('font-size', '16px', 'important')

    this.initialize()
    this.setupIdleLogout()

    if (this.$socket && this.user?._id) {
      this.$socket.emit('identify', { userId: this.user._id })
    }

    await this.getCategories()
    await this.getProfile()
    await this.getRoom()
    this.loadCoinCosts()

    await this.loadFriends()
    await this.loadDMConversations()
    this.loadSupportContact()

    this._onResize = () => {
      this.closeFriendMenu()
      this.closeRoomMenu()
      if (window.innerWidth > 768 && this.sidebarOpen) {
        this.closeSidebar()
      }
    }
    window.addEventListener('resize', this._onResize)

    this._onSidebarScroll = () => {
      this.closeFriendMenu()
      this.closeRoomMenu()
    }
    this.$nextTick(() => {
      const sc = this.$el.querySelector('.sidebar-content')
      if (sc) { sc.addEventListener('scroll', this._onSidebarScroll, { passive: true }) }
      this._sidebarScrollEl = sc
    })

    this.$socket.on('friendStatusUpdate', this.onFriendStatusUpdate)
    this.$socket.on('dm:new', this.onIncomingDM)
    this.$socket.on('friend:request', this.onFriendRequest)
    this.$socket.on('friend:accepted', this.onFriendAccepted)

    await this.loadFriendRequests()
    this.setupNotifications()

    const userData = localStorage.getItem('userData')
    if (userData) {
      this.user = JSON.parse(userData)
    }

    this.handleDmQuery()
  },
  beforeDestroy () {
    clearTimeout(this.idleTimer)
    clearTimeout(this._dmPulseT)
    if (this._idleEvents) {
      this._idleEvents.forEach(e => window.removeEventListener(e, this._idleReset))
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize)
    }
    if (this._sidebarScrollEl && this._onSidebarScroll) {
      this._sidebarScrollEl.removeEventListener('scroll', this._onSidebarScroll)
    }
    if (this.$socket) {
      this.$socket.off('friendStatusUpdate', this.onFriendStatusUpdate)
      this.$socket.off('dm:new', this.onIncomingDM)
      this.$socket.off('friend:request', this.onFriendRequest)
      this.$socket.off('friend:accepted', this.onFriendAccepted)
    }
    document.body.style.overflow = ''
    document.documentElement.style.removeProperty('font-size')
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    toggleSidebar () {
      this.sidebarOpen = !this.sidebarOpen
      if (this.sidebarOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },

    closeSidebar () {
      this.sidebarOpen = false
      document.body.style.overflow = ''
    },
    toggleRoomsSection () {
      this.roomsCollapsed = !this.roomsCollapsed
      localStorage.setItem('sidebarRoomsCollapsed', this.roomsCollapsed ? '1' : '0')
    },
    toggleFriendsSection () {
      this.friendsCollapsed = !this.friendsCollapsed
      localStorage.setItem('sidebarFriendsCollapsed', this.friendsCollapsed ? '1' : '0')
    },
    toggleRoomSearchBox () {
      this.showRoomSearchBox = !this.showRoomSearchBox
      if (!this.showRoomSearchBox) {
        this.roomSearch = ''
        return
      }
      this.roomsCollapsed = false
      this.$nextTick(() => this.$refs.roomSearchInput && this.$refs.roomSearchInput.focus())
    },
    toggleFriendSearchBox () {
      this.showFriendSearchBox = !this.showFriendSearchBox
      if (!this.showFriendSearchBox) {
        this.friendSearch = ''
        return
      }
      this.friendsCollapsed = false
      this.$nextTick(() => this.$refs.friendSearchInput && this.$refs.friendSearchInput.focus())
    },
    openDirectMessage (friend) {
      this.dmSupportMode = false
      this.selectedFriend = {
        friendId: friend.friendId,
        displayName: friend.displayName || friend.fullname || 'เพื่อน',
        fullname: friend.fullname || friend.displayName,
        avatar: friend.avatar || null
      }
      this.$nextTick(() => {
        if (this.$refs.dmModal) {
          this.$refs.dmModal.open()
        }
      })
      const conv = this.dmConversations.find(c => c.friendId === friend.friendId)
      if (conv) { conv.unreadCount = 0 }
    },
    toggleDmPanel () {
      this.dmPanelOpen = !this.dmPanelOpen
      if (this.dmPanelOpen) {
        this.dmSearch = ''
        this.loadDMConversations()
        this.closeSidebar()
        this.closeFriendMenu()
        this.closeRoomMenu()
      }
    },
    openDmFromPanel (dm) {
      this.dmPanelOpen = false
      this.openDirectMessage(dm)
    },
    handleDmQuery () {
      const dmId = this.$route.query.dm
      if (!dmId) { return }
      this.$router.replace({ path: '/chat/chat' })
      const friend = this.allFriends.find(f => String(f.friendId) === String(dmId)) ||
        this.dmConversations.find(c => String(c.friendId) === String(dmId))
      if (friend) {
        this.openDirectMessage(friend)
      } else {
        this.friendToast('info', 'ทักแชทส่วนตัวได้เฉพาะเพื่อน — เพิ่มเพื่อนก่อน')
      }
    },
    getInitials (name) {
      if (!name) { return '?' }
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
    },

    updateFriendLists () {
      this.onlineFriends = this.friends.filter(f => f.isOnline)
      this.offlineFriends = this.friends.filter(f => !f.isOnline)
    },

    openFriendMenu (friend, event) {
      const rect = event.currentTarget.getBoundingClientRect()
      if (this.friendMenu.open && this.friendMenu.friend &&
          this.friendMenu.friend.friendId === friend.friendId) {
        this.closeFriendMenu()
        return
      }
      this.friendMenu = {
        open: true,
        friend,
        x: rect.right,
        y: rect.bottom + 6
      }
    },

    closeFriendMenu () {
      this.friendMenu.open = false
    },

    fmProfile () {
      const f = this.friendMenu.friend
      this.closeFriendMenu()
      if (f) { this.viewFriendProfile(f) }
    },

    fmMessage () {
      const f = this.friendMenu.friend
      this.closeFriendMenu()
      if (f) { this.openDirectMessage(f) }
    },

    fmRemove () {
      const f = this.friendMenu.friend
      this.closeFriendMenu()
      if (f) { this.removeFriend(f.friendId) }
    },

    openRoomMenu (room, event) {
      const rect = event.currentTarget.getBoundingClientRect()
      if (this.roomMenu.open && this.roomMenu.room && this.roomMenu.room._id === room._id) {
        this.closeRoomMenu()
        return
      }
      this.roomMenu = { open: true, room, x: rect.right, y: rect.bottom + 6 }
    },

    closeRoomMenu () {
      this.roomMenu.open = false
    },

    rmOpen () {
      const r = this.roomMenu.room
      this.closeRoomMenu()
      if (r) { this.goToRoom(r._id) }
    },

    rmLeave () {
      const r = this.roomMenu.room
      this.closeRoomMenu()
      if (r) { this.removeJoinRoom(r._id) }
    },

    escapeHtml (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]))
    },

    async viewFriendProfile (friend) {
      this.profileFriend = friend
      this.profileData = null
      this.profileLoading = true
      this.showProfileModal = true
      try {
        const url = process.env.API_PROFILE_FRIEND_ID.replace(':friendId', friend.friendId)
        const res = await this.$axios.$get(url)
        this.profileData = res.data || null
      } catch (err) {
        this.profileData = null
      } finally {
        this.profileLoading = false
      }
    },

    closeProfile () {
      this.showProfileModal = false
      this.profileFriend = null
      this.profileData = null
    },

    profileMessage () {
      const f = this.profileFriend
      this.closeProfile()
      if (f) { this.openDirectMessage(f) }
    },

    profileBlock () {
      const f = this.profileFriend
      this.closeProfile()
      if (f) { this.blockUser(f) }
    },

    fmtProfileDate (d) {
      if (!d) { return '—' }
      try {
        return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      } catch {
        return '—'
      }
    },

    fmtLastActive (d) {
      if (!d) { return 'ไม่ทราบ' }
      const diff = Date.now() - new Date(d).getTime()
      if (diff < 0) { return 'เมื่อสักครู่' }
      const m = Math.floor(diff / 60000)
      if (m < 1) { return 'เมื่อสักครู่' }
      if (m < 60) { return `${m} นาทีที่แล้ว` }
      const h = Math.floor(m / 60)
      if (h < 24) { return `${h} ชั่วโมงที่แล้ว` }
      const days = Math.floor(h / 24)
      if (days < 30) { return `${days} วันที่แล้ว` }
      return this.fmtProfileDate(d)
    },

    onFriendStatusUpdate ({ friendId, status, lastSeen }) {
      const friend = this.friends.find(f => f.friendId === friendId)
      if (friend) {
        friend.status = status
        friend.isOnline = status === 'online'
        friend.lastActive = lastSeen
        this.updateFriendLists()
      }
    },

    async onFriendRequest (payload) {
      await this.loadFriendRequests()
      const name = payload?.from?.displayName || 'มีผู้ใช้'
      this.showNotification('คำขอเป็นเพื่อนใหม่', `${name} ส่งคำขอเป็นเพื่อนถึงคุณ`)
      this.$swal({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `👋 ${name} ส่งคำขอเป็นเพื่อน`,
        showConfirmButton: false,
        timer: 4000
      })
    },

    async onFriendAccepted () {
      await this.loadFriends()
      this.$swal({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🎉 มีเพื่อนใหม่เพิ่มเข้ามาแล้ว',
        showConfirmButton: false,
        timer: 3000
      })
    },

    async loadSupportContact () {
      try {
        const res = await this.$axios.$get(process.env.API_SUPPORT_CONTACT)
        const s = res.result
        if (!s || !s.userId) { return }
        if (String(s.userId) === String(this.user._id)) { return }
        this.supportContact = {
          friendId: s.userId,
          displayName: 'ฝ่ายช่วยเหลือ (แอดมิน)',
          fullname: s.displayName || 'ผู้ดูแลระบบ',
          avatar: s.avatar ? this.resolveAsset(s.avatar) : null,
          status: s.online ? 'online' : 'offline'
        }
        this.loadSupportUnread()
      } catch (e) {}
    },

    async loadSupportUnread () {
      try {
        const res = await this.$axios.$get(process.env.API_SUPPORT_UNREAD)
        this.supportUnreadCount = (res.result && res.result.count) || 0
      } catch (e) {}
    },

    openSupportChat () {
      if (!this.supportContact) { return }
      this.dmPanelOpen = false
      this.dmSupportMode = true
      this.selectedFriend = {
        friendId: this.supportContact.friendId,
        displayName: 'ฝ่ายช่วยเหลือ (แอดมิน)',
        fullname: 'ฝ่ายช่วยเหลือ',
        avatar: this.supportContact.avatar
      }
      this.$nextTick(() => {
        if (this.$refs.dmModal) { this.$refs.dmModal.open() }
      })
      this.supportUnreadCount = 0
    },

    async loadDMConversations () {
      try {
        const res = await this.$axios.$get(process.env.API_DM_CONVERSATIONS)
        const list = res.result || []
        this.dmConversations = list
          .map(c => ({
            ...c,
            avatar: c.avatar ? this.resolveAsset(c.avatar) : null
          }))
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      } catch (err) {
      }
    },

    onIncomingDM (m) {
      if (m.channel === 'support') {
        const supportOpen = this.$refs.dmModal && this.$refs.dmModal.showModal && this.dmSupportMode
        if (!supportOpen) {
          this.supportUnreadCount += 1
          this.dmFabPulse = true
          clearTimeout(this._dmPulseT)
          this._dmPulseT = setTimeout(() => { this.dmFabPulse = false }, 1600)
          this.showNotification('ข้อความใหม่จากฝ่ายช่วยเหลือ', m.content)
          this.$swal({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `🎧 ฝ่ายช่วยเหลือ: ${m.content.slice(0, 40)}`,
            showConfirmButton: false,
            timer: 4000
          })
        }
        return
      }

      const isOpen =
        this.$refs.dmModal &&
        this.$refs.dmModal.showModal &&
        !this.dmSupportMode &&
        this.selectedFriend &&
        this.selectedFriend.friendId === m.friendId

      const idx = this.dmConversations.findIndex(c => c.friendId === m.friendId)
      const conv = idx > -1 ? this.dmConversations[idx] : null
      if (conv) {
        conv.lastMessage = m.content
        conv.lastMessageAt = m.createdAt || new Date().toISOString()
        conv.lastFromMe = false
        if (!isOpen) { conv.unreadCount = (conv.unreadCount || 0) + 1 }
        if (idx > 0) {
          this.dmConversations.splice(idx, 1)
          this.dmConversations.unshift(conv)
        }
      }

      this.loadDMConversations()

      if (!isOpen) {
        this.dmFabPulse = true
        clearTimeout(this._dmPulseT)
        this._dmPulseT = setTimeout(() => { this.dmFabPulse = false }, 1600)
        const name = conv ? conv.displayName : 'เพื่อน'
        this.showNotification(`ข้อความใหม่จาก ${name}`, m.content)
        this.$swal({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: `💬 ${name}: ${m.content.slice(0, 40)}`,
          showConfirmButton: false,
          timer: 4000
        })
      }
    },

    onDmRead (friendId) {
      if (this.dmSupportMode || (this.supportContact && String(friendId) === String(this.supportContact.friendId))) {
        this.supportUnreadCount = 0
        return
      }
      const conv = this.dmConversations.find(c => c.friendId === friendId)
      if (conv) { conv.unreadCount = 0 }
    },

    onDmSent ({ friendId, content }) {
      if (this.dmSupportMode || (this.supportContact && String(friendId) === String(this.supportContact.friendId))) {
        this.supportUnreadCount = 0
        return
      }
      const idx = this.dmConversations.findIndex(c => c.friendId === friendId)
      if (idx > -1) {
        const conv = this.dmConversations[idx]
        conv.lastMessage = content
        conv.lastMessageAt = new Date().toISOString()
        conv.lastFromMe = true
        conv.unreadCount = 0
        if (idx > 0) {
          this.dmConversations.splice(idx, 1)
          this.dmConversations.unshift(conv)
        }
      } else {
        this.loadDMConversations()
      }
    },

    resolveAsset (url) {
      if (!url) { return null }
      if (/^https?:\/\//.test(url)) { return url }
      return (process.env.API_FILE_BASE || '') + url
    },

    setupIdleLogout () {
      const LIMIT = 30 * 60 * 1000
      this._idleReset = () => {
        clearTimeout(this.idleTimer)
        this.idleTimer = setTimeout(() => this.handleIdleLogout(), LIMIT)
      }
      this._idleEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
      this._idleEvents.forEach(e =>
        window.addEventListener(e, this._idleReset, { passive: true })
      )
      this._idleReset()
    },

    async handleIdleLogout () {
      ['token', 'userData', 'userStatus'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      await this.$swal({
        icon: 'warning',
        title: 'เซสชันหมดอายุ',
        text: 'ไม่มีการใช้งานเป็นเวลานาน กรุณาเข้าสู่ระบบใหม่'
      })
      this.$router.push('/login')
    },
    async getProfile () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_USER_BY_ID)
        if (res.status === 'success') {
          this.profile = res.result
        }
      } catch (err) {
        this.isLoading = false
      }
    },

    setting () {
      this.$refs.SettingDialog.open()
    },

    formatNumber (num) {
      return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString()
    },

    async getCategories () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_CATEGORIES_ROOM)
        if (res.status === 'success') { this.categories = res.result }
      } catch (err) {
        this.isLoading = false
      }
    },

    async loadCoinCosts () {
      try {
        const r = await this.$axios.$get(process.env.API_COINS_PACKAGES)
        this.privateRoomCost = r.result?.costs?.PRIVATE_ROOM ?? 0
      } catch (e) {}
    },

    async getRoom () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_ROOM)
        if (res.status === 'success') {
          this.rooms = res.result
          await this.getCountMessages()
        }
      } catch (err) {
        this.isLoading = false
      }
    },

    async getCountMessages () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_COUNT_ALL_CHAT_MESSAGES)
        if (res.status === 'success') {
          const counts = res.result || []
          this.rooms = this.rooms.map((room) => {
            const found = counts.find(c => c.roomId === room._id)
            return { ...room, messageCount: found ? found.count : 0 }
          })
        }
      } catch (err) {
        this.isLoading = false
      }
    },
    async removeJoinRoom (roomId) {
      const room = this.rooms.find(r => r._id === roomId)
      const c = await this.$swal({
        title: 'ออกจากห้องนี้?',
        text: room
          ? `คุณจะออกจากห้อง "${room.name}" และไม่เห็นข้อความในห้องนี้อีก`
          : 'คุณจะออกจากห้องนี้',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ออกจากห้อง',
        cancelButtonText: 'ยกเลิก'
      })
      if (!c.isConfirmed) { return }

      try {
        const token = localStorage.getItem('token')

        await this.$axios.$post(
          process.env.API_LEAVE_ROOM_USERS,
          {
            roomId,
            userId: this.user._id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        await this.getRoom()

        if (this.activeRoomId === roomId) {
          this.activeRoomId = null
        }

        await this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'ออกจากห้องเรียบร้อย'
        })
      } catch (err) {
        await this.$swal({
          icon: 'error',
          title: 'ผิดพลาด',
          text:
        err.response?.data?.message ||
        'ไม่สามารถออกจากห้องได้'
        })
      } finally {
        this.joiningRoom = null
      }
    },

    goToRoom (roomId) {
      this.activeRoomId = roomId
      if (window.innerWidth <= 768) {
        this.closeSidebar()
      }
      const roomData = this.rooms.find(r => r._id === roomId)
      if (!roomData) { return }
      this.$router.push({
        path: '/chat/room',
        query: {
          id: roomId,
          name: roomData.name,
          category: roomData.category || '',
          description: roomData.description || '',
          memberCount: roomData.memberCount || 0,
          tags: roomData.tags ? JSON.stringify(roomData.tags) : '[]',
          status: roomData.status || 'online',
          type: roomData.type || ''
        }
      })
    },

    async joinRoom (roomId) {
      const currentRoom = this.rooms.find(r => r._id === roomId)
      if (!currentRoom) { return }

      if (currentRoom.type === 'private') {
        this.joinRoomIdPending = roomId
        this.showJoinPasswordModal = true
        return
      }

      await this.joinRoomRequest(roomId)
    },

    async confirmJoinPrivateRoom () {
      if (!this.joinPassword.trim()) {
        return this.$swal({ icon: 'warning', title: 'แจ้งเตือน', text: 'กรุณากรอกรหัสผ่านก่อนเข้าห้อง' })
      }
      await this.joinRoomRequest(this.joinRoomIdPending, this.joinPassword)
      this.showJoinPasswordModal = false
      this.joinPassword = ''
    },

    async joinRoomRequest (roomId, password = null) {
      const token = localStorage.getItem('token')
      try {
        this.joiningRoom = roomId
        const roomData = this.rooms.find(r => r._id === roomId)

        const payload = {
          roomId,
          userId: this.user._id,
          fullname: this.user.fullname,
          avatar: this.user.avatar || '',
          type: roomData?.type || ''
        }

        if (password) {
          payload.password = password
        }

        const result = await this.$axios.$post(process.env.API_JOIN_ROOM_USERS, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (result.status === 'success') {
          await this.getRoom()
          this.friendToast('success', 'เข้าร่วมห้องสำเร็จ!')
          this.goToRoom(roomId)
        } else {
          await this.$swal({ icon: 'error', title: 'ผิดพลาด', text: result.message })
        }
      } catch (err) {
        await this.$swal({ icon: 'error', title: 'ผิดพลาด', text: err.response?.data?.message || 'เข้าร่วมไม่สำเร็จ' })
      } finally {
        this.joiningRoom = null
      }
    },

    isUserInRoom (roomId) {
      const room = this.rooms?.find(r => r._id === roomId)
      return !!room?.members?.some(m => m.userId === this.user._id)
    },

    resetNewRoom () {
      this.newRoom = { name: '', category: 'gaming', description: '', type: 'public', password: '', tags: [], iconGradient: '' }
      this.tagInput = ''
    },

    closeCreateRoom () {
      this.showCreateRoom = false
      this.resetNewRoom()
    },

    addTag () {
      const t = this.tagInput.trim().replace(/,+$/, '')
      if (!t) { return }
      if (this.newRoom.tags.length >= this.limit) { return }
      if (!this.newRoom.tags.includes(t)) { this.newRoom.tags.push(t) }
      this.tagInput = ''
    },

    removeTag (i) {
      this.newRoom.tags.splice(i, 1)
    },

    async createRoom () {
      if (this.creatingRoom) { return }
      if (!this.newRoom.name.trim()) {
        return this.friendToast('error', 'กรุณาระบุชื่อห้อง')
      }
      if (this.newRoom.type === 'private' && !this.newRoom.password) {
        return this.friendToast('error', 'ห้องส่วนตัวต้องตั้งรหัสผ่าน')
      }

      this.addTag()
      this.creatingRoom = true

      try {
        const token = localStorage.getItem('token')

        const selectedCategory = this.categories.find(cat => cat.key === this.newRoom.category)
        const categoryName = selectedCategory ? selectedCategory.name : ''
        const payload = { ...this.newRoom, categoryName }
        const response = await this.$axios.$post(process.env.API_CREATE_ROOM, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.status === 'success') {
          const createdName = payload.name
          this.showCreateRoom = false
          this.resetNewRoom()
          await this.getRoom()
          if (payload.type === 'private') { this.getProfile() }
          this.friendToast('success', `สร้างห้อง "${createdName}" สำเร็จ 🎉`)
        }
      } catch (err) {
        if (err.response?.status === 402) {
          const c = await this.$swal({
            icon: 'info',
            title: 'เหรียญไม่พอ',
            text: err.response.data?.message || 'ต้องเติมเหรียญก่อนสร้างห้องส่วนตัว',
            showCancelButton: true,
            confirmButtonText: 'ไปเติมเหรียญ',
            cancelButtonText: 'ปิด'
          })
          if (c.isConfirmed) { this.$router.push('/wallet') }
        } else {
          this.$swal({
            icon: 'error',
            title: 'ผิดพลาด',
            text: err.response?.data?.message || 'สร้างห้องไม่สำเร็จ'
          })
        }
      } finally {
        this.creatingRoom = false
      }
    },

    initialize () {
      const storedLoginData = JSON.parse(localStorage.getItem('userData'))
      if (storedLoginData) {
        this.loginData = storedLoginData
        this.isLogin = true
      }
    },

    async logout () {
      try {
        const result = await this.$swal({ title: 'ยืนยันการออกจากระบบ', text: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d', confirmButtonText: 'ออกจากระบบ', cancelButtonText: 'ยกเลิก' })
        if (result.isConfirmed) {
          this.$socket?.emit('statusChanged', { status: 'offline' });
          ['authPayrollToken', 'token', 'userData', 'userStatus'].forEach(key => localStorage.removeItem(key))
          if (this.$socket) {
            this.$socket.disconnect()
            this.$socket.connect()
          }
          this.$router.push('/')
        }
      } catch (err) {
        await this.$swal({ icon: 'error', title: 'ไม่สามารถออกจากระบบได้', text: 'เกิดข้อผิดพลาดขณะพยายามออกจากระบบ' })
      }
    },

    async loadFriends () {
      try {
        const res = await this.$axios.get(process.env.API_GET_ALL_FRIENDSHIP_ID)
        const friendsData = res.data.friends || []
        const currentUserId = this.user?._id || this.$store.state.user?._id
        const filteredFriends = friendsData.filter(friend => String(friend.friendId) !== String(currentUserId))

        this.friends = filteredFriends.map(friend => ({
          ...friend,
          displayName: friend.displayName ||
            [friend.firstName, friend.lastName].filter(Boolean).join(' ') ||
            friend.username || 'เพื่อน',
          avatar: friend.avatar ? this.resolveAsset(friend.avatar) : null,
          isOnline: friend.isOnline || friend.status === 'online' || false,
          lastMessage: friend.lastMessage || null,
          unreadCount: friend.unreadCount || 0
        }))

        this.updateFriendLists()
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดรายชื่อเพื่อนได้'
        })
      }
    },

    async loadFriendRequests () {
      try {
        const res = await this.$axios.get(process.env.API_PENDING_FRIEND)
        this.friendRequests = (res.data.requests || []).map((r) => {
          const requester = r.requester || {}
          const displayName = requester.displayName || `${requester.firstName || ''} ${requester.lastName || ''}`.trim() || requester.username || 'ผู้ใช้'
          return {
            _id: r._id,
            userName: displayName,
            userInitials: this.getInitials(displayName),
            avatar: requester.avatar ? this.resolveAsset(requester.avatar) : null,
            requestedAt: r.requestedAt
          }
        })
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดคำขอเป็นเพื่อนได้'
        })
      }
    },
    async searchUsers () {
      const q = this.userSearchQuery.trim()
      if (!q) {
        this.searchResults = []
        this.hasSearched = false
        return
      }
      this.isSearching = true
      try {
        const { data } = await this.$axios.get(process.env.API_SEARCH_FRIEND, {
          params: { q }
        })

        const users = data.users || []
        this.searchResults = users.map((u) => {
          const name = u.displayName || u.fullname || u.username || 'ผู้ใช้'
          return {
            _id: u._id,
            username: u.username,
            email: u.email || '',
            avatar: u.avatar ? this.resolveAsset(u.avatar) : null,
            displayName: name,
            initials: this.getInitials(name),
            isOnline: !!u.isOnline,
            friendStatus: u.friendStatus || 'none',
            friendshipId: u.friendshipId || null
          }
        })
      } catch (err) {
        this.searchResults = []
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถค้นหาผู้ใช้ได้'
        })
      } finally {
        this.isSearching = false
        this.hasSearched = true
      }
    },

    resetSearch () {
      this.isSearching = false
      this.hasSearched = false
      this.userSearchQuery = ''
      this.searchResults = []
    },
    clearSearchInput () {
      this.userSearchQuery = ''
      this.hasSearched = false
      this.searchResults = []
      this.$nextTick(() => this.$refs.afSearch && this.$refs.afSearch.focus())
    },
    closeModal () {
      this.showAddFriend = false
      this.resetSearch()
      this.afTab = 'search'
    },

    switchToSentTab () {
      this.afTab = 'sent'
      this.loadSentRequests()
    },

    async loadSentRequests () {
      this.loadingSent = true
      try {
        const res = await this.$axios.$get(process.env.API_SENT_FRIEND)
        const list = res.data || res.result || []
        this.sentRequests = list.map((r) => {
          const rec = r.recipient || {}
          const name = rec.displayName ||
            [rec.firstName, rec.lastName].filter(Boolean).join(' ') ||
            rec.username || 'ผู้ใช้'
          return {
            _id: r._id,
            recipientId: rec._id,
            displayName: name,
            username: rec.username,
            email: rec.email || '',
            avatar: rec.avatar ? this.resolveAsset(rec.avatar) : null,
            initials: this.getInitials(name)
          }
        })
      } catch (err) {
        this.sentRequests = []
      } finally {
        this.loadingSent = false
      }
    },

    async cancelSentRequest (r) {
      this.cancellingRequest = r._id
      try {
        await this.$axios.$delete(process.env.API_DELETE_CANCEL_FRIENDSHIP_ID.replace(':friendshipId', r._id))
        this.sentRequests = this.sentRequests.filter(x => x._id !== r._id)
        const inResults = this.searchResults.find(u => String(u._id) === String(r.recipientId))
        if (inResults) { this.$set(inResults, 'friendStatus', 'none') }
        this.friendToast('success', `ยกเลิกคำขอถึง ${r.displayName} แล้ว`)
      } catch (err) {
        this.friendToast('error', err.response?.data?.message || 'ยกเลิกคำขอไม่สำเร็จ')
      } finally {
        this.cancellingRequest = null
      }
    },

    friendBtn (u) {
      switch (u.friendStatus) {
        case 'accepted':
        case 'friends':
          return { cls: 'is-friend', icon: 'fas fa-check', text: 'เป็นเพื่อนแล้ว', disabled: true }
        case 'pending_sent':
          return { cls: 'is-pending', icon: 'fas fa-clock', text: 'รอตอบรับ', disabled: true }
        case 'pending_received':
          return { cls: 'is-accept', icon: 'fas fa-user-check', text: 'ตอบรับคำขอ', disabled: false }
        case 'rejected':
          return { cls: 'is-add', icon: 'fas fa-user-plus', text: 'เพิ่มเพื่อน', disabled: false }
        default:
          return { cls: 'is-add', icon: 'fas fa-user-plus', text: 'เพิ่มเพื่อน', disabled: false }
      }
    },

    handleFriendAction (u) {
      if (u.friendStatus === 'pending_received') {
        return this.acceptFriendFromSearch(u)
      }
      return this.sendFriendRequest(u)
    },

    friendToast (icon, title) {
      this.$swal({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 2600,
        timerProgressBar: true
      })
    },

    async resendVerifyEmail () {
      const email = (this.user && this.user.email) || ''
      if (!email) {
        this.friendToast('error', 'ไม่พบอีเมลของบัญชี')
        return
      }
      this.resendingVerify = true
      try {
        await this.$axios.$post(process.env.API_RESEND_VERIFICATION, { email }, { timeout: 20000 })
        this.friendToast('success', 'ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว')
      } catch (err) {
        const timedOut = err.code === 'ECONNABORTED' || /timeout/i.test(err.message || '')
        this.friendToast('error', timedOut ? 'ระบบส่งอีเมลใช้เวลานานผิดปกติ ลองใหม่ภายหลัง' : (err.response?.data?.message || 'ส่งอีเมลไม่สำเร็จ'))
      } finally {
        this.resendingVerify = false
      }
    },

    async acceptFriendFromSearch (u) {
      if (!u.friendshipId) {
        this.friendToast('info', 'ตอบรับคำขอนี้ได้จากช่อง "เพื่อนของฉัน"')
        return
      }
      this.sendingRequest = u._id
      try {
        await this.$axios.$post(process.env.API_POST_ACCEPT_FRIENDSHIP_ID.replace(':friendshipId', u.friendshipId))
        this.$set(u, 'friendStatus', 'accepted')
        await this.loadFriends()
        this.friendRequests = this.friendRequests.filter(r => r._id !== u.friendshipId)
        this.friendToast('success', `เป็นเพื่อนกับ ${u.displayName} แล้ว 🎉`)
      } catch (err) {
        this.friendToast('error', err.response?.data?.message || 'ไม่สามารถตอบรับคำขอได้')
      } finally {
        this.sendingRequest = null
      }
    },

    async sendFriendRequest (targetUser) {
      if (!['none', 'rejected'].includes(targetUser.friendStatus)) { return }
      this.sendingRequest = targetUser._id
      try {
        await this.$axios.post(process.env.API_SEND_FRIEND, {
          recipientId: targetUser._id
        })
        this.$set(targetUser, 'friendStatus', 'pending_sent')
        this.friendToast('success', `ส่งคำขอเป็นเพื่อนให้ ${targetUser.displayName || 'ผู้ใช้'} แล้ว`)
        if (this.sentRequests.length) { this.loadSentRequests() }
      } catch (err) {
        this.friendToast('error', err.response?.data?.message || 'ไม่สามารถส่งคำขอเป็นเพื่อนได้')
      } finally {
        this.sendingRequest = null
      }
    },

    async acceptFriend (requestId) {
      const request = this.friendRequests.find(r => r._id === requestId)
      try {
        await this.$axios.$post(process.env.API_POST_ACCEPT_FRIENDSHIP_ID.replace(':friendshipId', requestId))
        this.friendRequests = this.friendRequests.filter(r => r._id !== requestId)
        await this.loadFriends()
        this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: `ตอบรับคำขอเป็นเพื่อนกับ ${request ? request.userName : 'ผู้ใช้'} แล้ว`
        })
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถตอบรับคำขอเป็นเพื่อนได้'
        })
      }
    },

    async rejectFriend (requestId) {
      try {
        const confirmResult = await this.$swal({
          title: 'ยืนยันการปฏิเสธคำขอ',
          text: 'ยืนยันปฏิเสธคำขอใช่หรือไม่',
          icon: 'question',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#28a745'
        })

        if (confirmResult.isConfirmed) {
          await this.$axios.$post(process.env.API_POST_REJECT_FRIENDSHIP_ID.replace(':friendshipId', requestId))
          this.friendRequests = this.friendRequests.filter(r => r._id !== requestId)
          await this.$swal({
            title: 'สำเร็จ!',
            text: 'คุณได้ทำการปฏิเสธคำขอเรียบร้อย',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
        }
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถปฏิเสธคำขอได้'
        })
      }
    },

    async removeFriend (friendId) {
      try {
        const confirmResult = await this.$swal({
          title: 'ยืนยันการลบเพื่อน',
          text: 'ยืนยันลบเพื่อนของคุณออกใช่หรือไม่',
          icon: 'question',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#28a745'
        })
        if (confirmResult.isConfirmed) {
          await this.$axios.$delete(process.env.API_DELETE_REMOVE_FRIENDSHIP_ID.replace(':friendId', friendId))
          this.friends = this.friends.filter(f => f.friendId !== friendId)
          this.updateFriendLists()
          await this.$swal({
            title: 'สำเร็จ!',
            text: 'คุณได้ทำการลบเพื่อนของคุณเรียบร้อย',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
        }
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถลบเพื่อนได้'
        })
      }
    },

    fmBlock () {
      const f = this.friendMenu.friend
      this.closeFriendMenu()
      if (f) { this.blockUser(f) }
    },

    async blockUser (friend) {
      const result = await this.$swal({
        title: `บล็อก ${friend.displayName || friend.fullname || 'ผู้ใช้'}?`,
        text: 'ผู้ใช้นี้จะถูกลบออกจากเพื่อน และส่งข้อความหรือคำขอเป็นเพื่อนหากันไม่ได้',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'บล็อก',
        confirmButtonColor: '#d33'
      })
      if (!result.isConfirmed) { return }
      try {
        await this.$axios.$post(process.env.API_FRIENDS_BLOCK.replace(':userId', friend.friendId))
        this.friends = this.friends.filter(f => f.friendId !== friend.friendId)
        this.dmConversations = this.dmConversations.filter(c => c.friendId !== friend.friendId)
        this.updateFriendLists()
        this.friendToast('success', 'บล็อกผู้ใช้แล้ว')
      } catch (err) {
        this.friendToast('error', err.response?.data?.message || 'ไม่สามารถบล็อกผู้ใช้ได้')
      }
    },

    async openBlockedList () {
      let blocked = []
      try {
        const res = await this.$axios.$get(process.env.API_FRIENDS_BLOCKED)
        blocked = res.data || []
      } catch (err) {
        this.friendToast('error', 'ไม่สามารถโหลดรายชื่อที่ถูกบล็อกได้')
        return
      }

      if (!blocked.length) {
        this.$swal({ icon: 'info', title: 'ไม่มีผู้ใช้ที่ถูกบล็อก', timer: 1600, showConfirmButton: false })
        return
      }

      const esc = this.escapeHtml
      const rows = blocked.map(b => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #eee">
          <span>${esc(b.displayName || b.username || 'ผู้ใช้')}</span>
          <button data-unblock="${esc(String(b.userId))}" style="border:none;background:#7c6ff5;color:#fff;border-radius:8px;padding:4px 12px;cursor:pointer">ยกเลิกบล็อก</button>
        </div>`).join('')

      await this.$swal({
        title: 'ผู้ใช้ที่ถูกบล็อก',
        html: `<div style="text-align:left;max-height:320px;overflow:auto">${rows}</div>`,
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: (el) => {
          el.querySelectorAll('[data-unblock]').forEach((btn) => {
            btn.addEventListener('click', async () => {
              btn.disabled = true
              try {
                await this.$axios.$delete(process.env.API_FRIENDS_BLOCK.replace(':userId', btn.dataset.unblock))
                btn.closest('div').remove()
                this.friendToast('success', 'ยกเลิกการบล็อกแล้ว')
                await this.loadFriends()
              } catch (err) {
                btn.disabled = false
                this.friendToast('error', 'ไม่สามารถยกเลิกการบล็อกได้')
              }
            })
          })
        }
      })
    },

    setupNotifications () {
      if (Notification.permission === 'default') { Notification.requestPermission() }
    },

    showNotification (title, body) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' })
        setTimeout(() => notification.close(), 5000)
      }
    }
  }

}
</script>

<style scoped>
.community-chat-app {
  --bg-app: #0C0B10;
  --bg-panel: #17151D;
  --bg-panel-raised: #1D1B25;
  --border-hair: rgba(255, 255, 255, 0.08);

  --coral: #FF5A45;
  --coral-dark: #E8412F;
  --amber: #FFC94D;
  --violet: #7C6CF5;
  --violet-dark: #5B4CDB;
  --green: #37C871;
  --grey: #6b7280;

  --text-cream: #F6F1E7;
  --text-body: #C9C4D6;
  --text-muted: #8B879C;

  --fs-display: 26px;
  --fs-h1: 21px;
  --fs-h2: 16px;
  --fs-h3: 14px;
  --fs-body: 14px;
  --fs-small: 12.5px;
  --fs-eyebrow: 10.5px;

  --fw-black: 800;
  --fw-bold: 700;
  --fw-semibold: 600;
  --fw-medium: 500;

  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --radius-pill: 999px;

  --shadow-card: 0 14px 34px rgba(0, 0, 0, 0.35);
}

* { box-sizing: border-box; }

.community-chat-app {
  display: flex;
  height: 100vh;
  height: 100dvh;
  background: var(--bg-app);
  color: var(--text-cream);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: var(--fs-body);
  line-height: 1.5;
  position: relative;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  height: 100vh;
  height: 100dvh;
  background: var(--bg-panel);
  display: flex;
  overflow: hidden;
  flex-direction: column;
  border-right: 1px solid var(--border-hair);
  position: relative;
  z-index: 1;
  padding-left: env(safe-area-inset-left);
}

.sidebar-header {
  padding: calc(22px + env(safe-area-inset-top)) 20px 22px;
  border-bottom: 1px solid var(--border-hair);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.workspace-info {
  display: flex;
  align-items: center;
}

.workspace-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, var(--coral), var(--violet));
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 18px;
  box-shadow: 0 8px 20px rgba(255, 90, 69, 0.28);
}

.workspace-details h4 {
  margin: 0;
  font-size: var(--fs-h3);
  font-weight: var(--fw-black);
  color: var(--text-cream);
  letter-spacing: -0.01em;
}

.workspace-members {
  font-size: var(--fs-small);
  color: var(--text-muted);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 16px 0;
}

.section {
  margin-bottom: 22px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 20px 12px;
}

.section-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.section-toggle i {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.15s ease;
}

.section-toggle i.collapsed { transform: rotate(-90deg); }

.section-header h6 {
  margin: 0;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.section-header-actions {
  display: flex;
  gap: 6px;
}

.add-channel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-hair);
  color: var(--text-body);
  cursor: pointer;
  padding: 7px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  transition: all 0.2s ease;
}

.add-channel-btn:hover {
  background: var(--coral);
  border-color: var(--coral);
  color: #fff;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-search {
  position: relative;
  padding: 0 20px 10px;
}

.sidebar-search i {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 12px;
}

.sidebar-search input {
  width: 100%;
  min-width: 0;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: 999px;
  color: var(--text-cream);
  font-family: inherit;
  font-size: 13px;
  padding: 7px 14px 7px 32px;
  outline: none;
}

.sidebar-search input:focus { border-color: var(--violet); }

.channel-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.channel-item.active {
  background: rgba(124, 108, 245, 0.22);
}

.channel-main {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  cursor: pointer;
}

.channel-prefix {
  color: var(--violet);
  font-weight: var(--fw-black);
  margin-right: 4px;
  font-size: var(--fs-body);
}

.channel-name {
  color: var(--text-cream);
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
}

.unread-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--coral);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-black);
}

.channel-menu-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin-left: 8px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  opacity: 0;
  transition: background 0.15s ease, color 0.15s ease, opacity 0.2s ease;
}

.channel-item:hover .channel-menu-btn {
  opacity: 1;
}

.channel-menu-btn:hover {
  background: rgba(124, 108, 245, 0.25);
  color: #fff;
}

.channels-list,
.friends-list {
  padding: 0 12px;
}

.friends-empty {
  padding: 12px 14px;
  font-size: var(--fs-small);
  color: var(--text-muted);
  line-height: 1.6;
}

.friends-empty i { color: var(--coral); }

.channel-item,
.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.18s ease;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
}

.channel-item:hover,
.friend-item:hover {
  background: rgba(124, 108, 245, 0.14);
  transform: translateX(2px);
}

.channel-item.active {
  background: rgba(124, 108, 245, 0.26);
  border-color: rgba(124, 108, 245, 0.4);
}

.channel-name,
.friend-name {
  font-size: var(--fs-body);
  flex: 1;
  font-weight: var(--fw-semibold);
  color: var(--text-cream);
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-avatar img,
.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 90, 69, 0.3);
}

.user-avatar img {
  overflow: hidden;
  color: transparent;
  font-size: 0;
}

.avatar-placeholder {
  background: linear-gradient(135deg, var(--coral), var(--violet));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid var(--bg-panel);
}

.status-indicator.online { background: var(--green); }
.status-indicator.offline { background: var(--grey); }

.friend-info { flex: 1; min-width: 0; }

.last-message {
  font-size: var(--fs-small);
  color: var(--text-muted);
  display: block;
  margin-top: 3px;
}

.friend-item.offline { opacity: 0.8; }

.friend-requests {
  padding: 0 10px;
  margin-bottom: 14px;
}

.friend-request {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--bg-panel-raised);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  border: 1px solid var(--border-hair);
}

.request-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-name {
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
}

.request-actions { display: flex; gap: 6px; }

.btn-accept,
.btn-reject {
  background: transparent;
  border: none;
  padding: 7px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-accept { color: var(--green); }
.btn-accept:hover { background: rgba(55, 200, 113, 0.14); }
.btn-reject { color: var(--coral); }
.btn-reject:hover { background: rgba(255, 90, 69, 0.14); }

.user-profile {
  padding: 16px 18px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: var(--bg-panel);
  border-top: 1px solid var(--border-hair);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.user-info { display: flex; align-items: center; flex: 1; min-width: 0; }
.user-details { margin-left: 12px; min-width: 0; }

.user-details .user-name {
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
  color: var(--text-cream);
  display: block;
}

.user-status {
  font-size: var(--fs-eyebrow);
  color: var(--green);
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-actions { display: flex; gap: 8px; }

.user-action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-hair);
  color: var(--text-body);
  cursor: pointer;
  padding: 9px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: all 0.2s ease;
}

.user-action-btn:hover {
  background: var(--violet);
  border-color: var(--violet);
  color: #fff;
}

.user-action-admin {
  background: rgba(255, 201, 77, 0.12);
  border-color: rgba(255, 201, 77, 0.4);
  color: var(--amber);
}

.user-action-admin:hover {
  background: var(--amber);
  border-color: var(--amber);
  color: #121218;
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
  z-index: 1;
}

.verify-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 201, 77, 0.14);
  border-bottom: 1px solid rgba(255, 201, 77, 0.3);
  color: #b9852a;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.verify-banner > .fas.fa-envelope {
  color: #e0a12e;
}

.verify-banner-text {
  flex: 1;
  min-width: 180px;
  font-weight: 600;
}

.verify-banner-btn {
  border: 1px solid #e0a12e;
  background: #e0a12e;
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 999px;
  padding: 6px 16px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.verify-banner-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.verify-banner-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.verify-banner-close {
  border: none;
  background: transparent;
  color: #b9852a;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 0.9rem;
}

.main-header {
  padding: 24px max(32px, env(safe-area-inset-right)) 24px 32px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-hair);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
}

.header-left .eyebrow {
  display: block;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-bold);
  color: var(--coral);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.header-left h1 {
  margin: 0 0 6px;
  font-size: var(--fs-display);
  font-weight: var(--fw-black);
  color: var(--text-cream);
  letter-spacing: -0.01em;
}

.header-left p {
  margin: 0;
  font-size: var(--fs-body);
  color: var(--text-muted);
}

.header-right { display: flex; align-items: center; gap: 12px; }

.coin-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 201, 77, 0.12);
  border: 1px solid rgba(255, 201, 77, 0.3);
  color: var(--text-cream);
  font-weight: 800;
  font-size: 15px;
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.coin-pill:hover { background: rgba(255, 201, 77, 0.2); }
.coin-pill-plus {
  font-size: 10px;
  color: #ffc94d;
  border: 1px solid rgba(255, 201, 77, 0.5);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-container { width: 400px; min-width: 220px; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 13px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 13px 18px 13px 44px;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius-pill);
  color: var(--text-cream);
  font-size: var(--fs-body);
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder { color: var(--text-muted); }

.search-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--coral);
}

.categories-filter {
  padding: 16px 32px;
  border-bottom: 1px solid var(--border-hair);
  background: var(--bg-panel);
}

.filter-tabs { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

.filter-tab {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  color: var(--text-body);
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.filter-tab:hover {
  border-color: rgba(255, 90, 69, 0.4);
  color: #fff;
}

.filter-tab.active {
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: #ffffff;
  border-color: var(--coral);
}

.rooms-container { flex: 1; overflow-y: auto; padding: 24px 32px 32px; }

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  width: min(100%, 1420px);
  margin: 0 auto;
}

.room-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.room-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 90, 69, 0.35);
}

.room-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.room-icon-wrapper { margin-right: 2px; }

.room-icon {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.3);
}

.room-title {
  margin: 0 0 4px;
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
  color: #ffffff;
  letter-spacing: -0.01em;
}

.room-category {
  font-size: var(--fs-eyebrow);
  color: var(--violet);
  text-transform: uppercase;
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
}

.room-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--border-hair);
  border-bottom: 1px solid var(--border-hair);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--fs-small);
  color: var(--text-muted);
  font-weight: var(--fw-semibold);
}

.room-description p {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--text-body);
  line-height: 1.65;
}

.room-tags { margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 8px; }

.tag {
  background: rgba(124, 108, 245, 0.14);
  color: #C7BDFF;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-bold);
  border: 1px solid rgba(124, 108, 245, 0.2);
}

.room-actions { display: flex; gap: 12px; }

.join-btn {
  flex: 1;
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: white;
  border: none;
  padding: 13px 22px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(255, 90, 69, 0.3);
}

.join-btn:disabled,
.join-btn.disabled {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  cursor: not-allowed;
}

.af-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(6, 5, 10, 0.68);
  backdrop-filter: blur(2px);
}

.af-panel {
  width: 100%;
  max-width: 460px;
  max-height: min(82vh, 640px);
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.af-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, var(--coral), var(--violet));
}

.af-title {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 9px;
}

.af-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
}

.af-close:hover { background: rgba(255, 255, 255, 0.35); transform: rotate(90deg); }

.pf-panel {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.pf-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
}
.pf-close:hover { background: rgba(0, 0, 0, 0.55); transform: rotate(90deg); }

.pf-cover {
  height: 88px;
  background: linear-gradient(135deg, var(--coral), var(--violet));
}

.pf-avatar-wrap {
  position: relative;
  width: 92px;
  height: 92px;
  margin: -46px auto 0;
}

.pf-avatar {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--bg-panel);
  background: var(--bg-panel-raised);
  display: block;
}

.pf-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: var(--fw-black);
  color: var(--text-cream);
}

.pf-status-dot {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--bg-panel);
}
.pf-status-dot.online { background: var(--green); }
.pf-status-dot.offline { background: var(--grey); }

.pf-body {
  padding: 12px 22px 4px;
  text-align: center;
}

.pf-name {
  margin: 0;
  font-size: var(--fs-h1);
  font-weight: var(--fw-black);
  color: var(--text-cream);
}

.pf-status-text {
  display: inline-block;
  margin-top: 3px;
  font-size: var(--fs-small);
  font-weight: var(--fw-semibold);
}
.pf-status-text.online { color: var(--green); }
.pf-status-text.offline { color: var(--text-muted); }

.pf-loading {
  padding: 22px 0;
  color: var(--text-muted);
  font-size: var(--fs-small);
}

.pf-bio {
  margin: 14px 0 0;
  font-size: var(--fs-body);
  line-height: 1.55;
  color: var(--text-body);
  white-space: pre-wrap;
  word-break: break-word;
}
.pf-bio-empty { color: var(--text-muted); font-style: italic; }

.pf-rows {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.pf-row {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: var(--fs-small);
  color: var(--text-body);
}

.pf-row i {
  width: 16px;
  text-align: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.pf-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pf-actions {
  display: flex;
  gap: 10px;
  padding: 18px 22px 22px;
}

.pf-btn {
  flex: 1;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
}

.pf-btn-primary {
  background: var(--violet);
  color: #fff;
}
.pf-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(124, 108, 245, 0.35);
}

.pf-btn-danger {
  flex: 0 0 auto;
  background: rgba(255, 90, 69, 0.12);
  color: var(--coral);
}
.pf-btn-danger:hover { background: rgba(255, 90, 69, 0.2); }

@media (max-width: 480px) {
  .pf-panel { max-width: 100%; }
}

.af-tabs {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
  padding: 10px 18px 0;
}

.af-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 10px;
  border: 1px solid var(--border-hair);
  border-radius: 10px 10px 0 0;
  background: transparent;
  color: var(--text-muted, rgba(255, 255, 255, 0.6));
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.af-tab.active {
  background: var(--violet);
  border-color: var(--violet);
  color: #fff;
}

.af-tab-badge {
  background: var(--coral);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}

.af-search-row {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-hair);
}

.af-search-box {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
}

.af-search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  font-size: 13px;
  pointer-events: none;
}

.af-search-box input {
  width: 100%;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius-pill);
  color: var(--text-cream);
  font-size: var(--fs-body);
  padding: 11px 36px 11px 38px;
  outline: none;
}

.af-search-box input::placeholder { color: var(--text-muted); }
.af-search-box input:focus { border-color: var(--coral); }

.af-clear {
  position: absolute;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.af-search-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 18px;
  border-radius: var(--radius-pill);
  border: none;
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: #fff;
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: filter 0.15s ease;
}

.af-search-btn:not(:disabled):hover { filter: brightness(1.08); }
.af-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.af-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 18px 18px;
}

.af-state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  text-align: center;
}

.af-state i { font-size: 34px; opacity: 0.7; }
.af-state p { margin: 0; font-size: var(--fs-body); }

.af-fade-enter-active,
.af-fade-leave-active { transition: opacity 0.18s ease; }
.af-fade-enter,
.af-fade-leave-to { opacity: 0; }
.af-fade-enter .af-panel,
.af-fade-leave-to .af-panel,
.af-fade-enter .cr-panel,
.af-fade-leave-to .cr-panel { transform: scale(0.96); }
.af-panel,
.cr-panel { transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1); }

@media (max-width: 520px) {
  .af-overlay { padding: 0; align-items: flex-end; }
  .af-panel { max-width: 100%; max-height: 90vh; border-radius: 18px 18px 0 0; }
  .af-search-row { flex-wrap: wrap; }
  .af-search-btn { width: 100%; justify-content: center; padding: 10px; }
}

.cr-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(6, 5, 10, 0.68);
  backdrop-filter: blur(2px);
}

.cr-panel {
  width: 100%;
  max-width: 520px;
  max-height: min(88vh, 720px);
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.cr-panel-sm { max-width: 400px; }

.cr-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, var(--coral), var(--violet));
}

.cr-title {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 9px;
}

.cr-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cr-field { display: flex; flex-direction: column; gap: 7px; }

.cr-field > label {
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  color: var(--text-cream);
}

.cr-hint { font-size: 11px; color: var(--text-muted); font-weight: 400; }

.cr-input {
  width: 100%;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: 12px;
  color: var(--text-cream);
  font-size: var(--fs-body);
  font-family: inherit;
  padding: 11px 14px;
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}

textarea.cr-input { resize: vertical; min-height: 76px; }

.cr-input::placeholder { color: var(--text-muted); }
.cr-input:focus { border-color: var(--coral); background: rgba(255, 255, 255, 0.06); }

select.cr-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23999' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

select.cr-input option {
  background: #1D1B25;
  color: #F6F1E7;
}

.cr-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cr-type {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid var(--border-hair);
  background: var(--bg-panel-raised);
  color: var(--text-cream);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  text-align: left;
}

.cr-type i { font-size: 16px; color: var(--text-muted); margin-bottom: 2px; }
.cr-type-name { font-weight: var(--fw-black); font-size: var(--fs-body); }
.cr-type-desc { font-size: 11px; color: var(--text-muted); }

.cr-type.active {
  border-color: var(--coral);
  background: rgba(255, 92, 77, 0.12);
}
.cr-type.active i { color: var(--coral); }

.cr-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  min-height: 44px;
  align-items: center;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: 12px;
}

.cr-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 10px;
  border-radius: 999px;
  background: rgba(124, 111, 245, 0.22);
  color: var(--text-cream);
  font-size: 12px;
  font-weight: 600;
}

.cr-tag button {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cr-tag-input {
  flex: 1;
  min-width: 120px;
  border: none;
  background: transparent;
  color: var(--text-cream);
  font-size: var(--fs-body);
  font-family: inherit;
  outline: none;
  padding: 4px;
}
.cr-tag-input::placeholder { color: var(--text-muted); }

.cr-swatches { display: flex; flex-wrap: wrap; gap: 10px; }

.cr-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.12s ease, border-color 0.12s ease;
  padding: 0;
}
.cr-swatch:hover { transform: scale(1.08); }
.cr-swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--coral);
}

.cr-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--border-hair);
  background: var(--bg-panel);
}

.cr-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
  font-family: inherit;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: filter 0.15s ease, background 0.15s ease;
}

.cr-btn-ghost { background: var(--bg-panel-raised); color: var(--text-cream); }
.cr-btn-ghost:hover { background: rgba(255, 255, 255, 0.08); }

.cr-btn-primary { background: linear-gradient(135deg, var(--coral), var(--violet)); color: #fff; }
.cr-btn-primary:not(:disabled):hover { filter: brightness(1.08); }
.cr-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 520px) {
  .cr-overlay { padding: 0; align-items: flex-end; }
  .cr-panel { max-width: 100%; max-height: 92vh; border-radius: 18px 18px 0 0; }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  color: var(--text-muted);
}

.empty-state p { color: var(--text-muted); font-size: var(--fs-body); margin-top: 8px; }

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top: 3px solid var(--coral);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-state i { font-size: 40px; margin-bottom: 14px; color: var(--text-muted); }

.search-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 2px;
}

.user-result {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg-panel-raised);
  border-radius: var(--radius-md);
  gap: 12px;
  border: 1px solid var(--border-hair);
  transition: border-color 0.2s ease;
}

.user-result:hover { border-color: rgba(255, 90, 69, 0.35); }

.user-result .user-avatar { position: relative; margin: 0; flex-shrink: 0; }
.user-result .user-avatar img,
.user-result .avatar-placeholder { width: 42px; height: 42px; font-size: var(--fs-small); }

.user-online-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--green);
  border: 2px solid var(--bg-panel-raised);
}

.user-result .user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.user-result .user-info h4 {
  margin: 0 0 2px;
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
  color: var(--text-cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.user-result .user-info p {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.friend-add-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease;
}

.friend-add-btn:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.08); }
.friend-add-btn:not(:disabled):active { transform: translateY(0); }

.friend-add-btn.is-add {
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: #fff;
}

.friend-add-btn.is-accept {
  background: var(--green);
  color: #fff;
}

.friend-add-btn.is-pending {
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-muted);
  border-color: var(--border-hair);
  cursor: default;
}

.friend-add-btn.is-friend {
  background: rgba(55, 200, 113, 0.14);
  color: var(--green);
  border-color: rgba(55, 200, 113, 0.35);
  cursor: default;
}

.friend-add-btn.is-cancel {
  background: rgba(255, 90, 69, 0.14);
  color: var(--coral);
  border-color: rgba(255, 90, 69, 0.35);
}

@media (max-width: 480px) {
  .user-result { flex-wrap: wrap; }
  .user-result .user-info { flex-basis: calc(100% - 54px); }
  .friend-add-btn { width: 100%; justify-content: center; margin-top: 4px; }
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
::-webkit-scrollbar-thumb { background: rgba(255, 90, 69, 0.4); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 90, 69, 0.6); }

.community-hero {
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  text-align: center;
  padding: 18px 26px;
  margin: 0 32px;
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 28px rgba(255, 90, 69, 0.22);
  position: relative;
  overflow: hidden;
}

.community-content { position: relative; z-index: 1; }

.community-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  margin-bottom: 8px;
  font-size: 16px;
  color: white;
}

.community-title {
  font-size: 20px;
  font-weight: var(--fw-black);
  color: #ffffff;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.community-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.55;
  max-width: 520px;
  margin: 0 auto;
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: calc(16px + env(safe-area-inset-top));
  left: calc(16px + env(safe-area-inset-left));
  z-index: 101;
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(255, 90, 69, 0.4);
  transition: all 0.3s;
}

.mobile-menu-toggle:hover { transform: scale(1.05); }
.mobile-menu-toggle:active { transform: scale(0.95); }

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 1024px) {
  .sidebar { width: 280px; }
  .rooms-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .main-header { padding: 20px 24px; }
  .rooms-container { padding: 20px 24px; }
  .community-hero { margin: 0 24px; }
}

@media (max-width: 768px) {
  .mobile-menu-toggle { display: flex; }
  .sidebar-overlay { display: block; }
  .sidebar { position: fixed; left: -320px; top: 0; bottom: 0; height: 100dvh; width: 320px; z-index: 100; transition: left 0.3s ease; }
  .sidebar.open { left: 0; }
  .main-content { width: 100%; }
  .main-header { flex-direction: column; gap: 10px; align-items: stretch; padding: 12px max(18px, env(safe-area-inset-right)) 12px max(18px, env(safe-area-inset-left)); padding-top: calc(70px + env(safe-area-inset-top)); }
  .header-left .eyebrow { margin-bottom: 2px; }
  .header-left h1 { font-size: 20px; margin: 0; }
  .header-left p { display: none; }
  .search-container { width: 100%; }
  .community-hero { display: none; }
  .rooms-grid { grid-template-columns: 1fr; gap: 16px; }
  .rooms-container { padding: 16px 18px; }
  .filter-tabs { gap: 8px; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 6px; }
  .filter-tab { padding: 9px 16px; font-size: 12px; }
  .categories-filter { padding: 12px 18px; }
  .channel-menu-btn { opacity: 1; }
}

@media (max-width: 640px) {
  .workspace-icon { width: 38px; height: 38px; font-size: 16px; }
  .workspace-details h4 { font-size: 14px; }
  .main-header { padding: calc(66px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 12px max(16px, env(safe-area-inset-left)); }
  .header-left h1 { font-size: 19px; }
  .rooms-container { padding: 12px 14px; }
  .room-card { padding: 20px; }
  .room-icon { width: 48px; height: 48px; font-size: 18px; }
  .room-title { font-size: 15px; }
  .community-hero { padding: 18px 16px; }
  .community-title { font-size: 20px; }
  .community-icon-large { width: 48px; height: 48px; margin-bottom: 12px; }
  .community-icon-large i { font-size: 18px; }
  .filter-tabs { justify-content: flex-start; }
  .filter-tab { white-space: nowrap; flex-shrink: 0; }
  .categories-filter { padding: 10px 14px; }
}

@media (max-width: 480px) {
  .room-card-header { flex-direction: column; align-items: flex-start; }
  .room-icon-wrapper { margin-right: 0; margin-bottom: 10px; }
  .room-stats { flex-direction: column; gap: 8px; align-items: flex-start; }
  .room-actions { flex-direction: column; }
  .join-btn { width: 100%; }
  .user-profile { padding: 12px; }
  .user-avatar img,
  .avatar-placeholder { width: 32px; height: 32px; }
  .user-details .user-name { font-size: 12px; }
  .user-status { font-size: 10px; }
  .sidebar-header { padding: 14px; }
  .section-header { padding: 6px 14px; }
  .channels-list,
  .friends-list { padding: 0 8px; }
  .friend-requests { padding: 0 8px; }
}

.game-sidebar-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: rgba(55, 200, 113, 0.06);
  border: 1px solid rgba(55, 200, 113, 0.18);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.game-sidebar-btn:hover {
  background: rgba(55, 200, 113, 0.14);
  border-color: rgba(55, 200, 113, 0.4);
  transform: translateX(2px);
}

.game-btn-icon {
  font-size: 20px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(55, 200, 113, 0.12);
  border-radius: 10px;
  flex-shrink: 0;
}

.game-btn-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.game-btn-title { font-size: var(--fs-small); font-weight: var(--fw-bold); color: var(--text-cream); }
.game-btn-sub { font-size: var(--fs-eyebrow); color: rgba(55, 200, 113, 0.75); text-transform: uppercase; letter-spacing: 0.04em; }
.game-btn-arrow { color: rgba(55, 200, 113, 0.5); font-size: 11px; }

.friend-actions { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.friend-menu-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: background 0.15s ease, color 0.15s ease;
}

.friend-item:hover .friend-menu-btn { color: var(--text-body); }
.friend-menu-btn:hover { background: rgba(124, 108, 245, 0.25); color: #fff; }

.friend-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4000;
}

.friend-menu {
  position: fixed;
  min-width: 180px;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: fm-pop 0.12s ease-out;
}

@keyframes fm-pop {
  from { opacity: 0; transform: translateY(-4px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.friend-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--text-cream);
  font-size: var(--fs-small);
  font-weight: var(--fw-medium);
  text-align: left;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.friend-menu button i { width: 15px; text-align: center; font-size: 13px; opacity: 0.85; }
.friend-menu button:hover { background: rgba(124, 108, 245, 0.2); color: #fff; }
.friend-menu button.danger { color: var(--coral); }
.friend-menu button.danger:hover { background: rgba(255, 90, 69, 0.16); color: #ff8a76; }

.dm-fab {
  position: fixed;
  right: calc(20px + env(safe-area-inset-right));
  bottom: calc(20px + env(safe-area-inset-bottom));
  z-index: 60;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--coral), var(--violet));
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  transition: transform 0.18s ease;
}

.dm-fab:hover { transform: translateY(-2px) scale(1.04); }
.dm-fab.open { background: var(--bg-panel-raised); border: 1px solid var(--border-hair); }
.dm-fab.pulse { animation: dm-fab-pulse 0.5s ease 2; }

@keyframes dm-fab-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45); }
  50% { transform: scale(1.12); box-shadow: 0 0 0 10px rgba(255, 90, 69, 0.18), 0 10px 28px rgba(0, 0, 0, 0.45); }
}

.dm-fab-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--coral);
  color: #fff;
  font-size: 11px;
  font-weight: var(--fw-black);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-app);
}

.dm-launcher-backdrop {
  position: fixed;
  inset: 0;
  z-index: 102;
  background: rgba(0, 0, 0, 0.5);
  display: none;
}

.dm-launcher-panel {
  position: fixed;
  right: calc(20px + env(safe-area-inset-right));
  bottom: calc(88px + env(safe-area-inset-bottom));
  z-index: 103;
  width: 344px;
  max-width: calc(100vw - 32px);
  height: min(560px, calc(100dvh - 140px));
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dm-launcher-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-hair);
}

.dm-launcher-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: var(--fw-black);
  color: var(--text-cream);
}

.dm-launcher-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 15px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dm-launcher-close:hover { background: rgba(255, 255, 255, 0.07); color: var(--text-cream); }

.dm-launcher-search {
  position: relative;
  padding: 10px 12px;
}

.dm-launcher-search i {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 12px;
}

.dm-launcher-search input {
  width: 100%;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: 999px;
  color: var(--text-cream);
  font-size: 13px;
  padding: 8px 14px 8px 34px;
  outline: none;
}

.dm-launcher-search input:focus { border-color: var(--violet); }

.dm-launcher-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 10px;
}

.dm-launcher-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.dm-launcher-empty i { font-size: 26px; opacity: 0.5; }
.dm-launcher-empty small { font-size: 11px; opacity: 0.7; }

.dm-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.dm-row:hover { background: rgba(255, 255, 255, 0.06); }
.dm-row.unread { background: rgba(255, 90, 69, 0.08); }
.dm-row.unread .dm-name { color: var(--text-cream); font-weight: var(--fw-black); }
.dm-row.unread .dm-last-message { color: var(--text-body); font-weight: var(--fw-semibold); }

.dm-row-support {
  border-radius: 0;
  margin: 0 -8px 4px;
  padding-left: 18px;
  padding-right: 18px;
  border-bottom: 1px solid var(--border-hair);
}

.dm-row-support .dm-name { color: var(--text-cream); }

.dm-avatar-support {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--violet), var(--coral));
  color: #fff;
  font-size: 13px;
}

.dm-launcher-enter-active,
.dm-launcher-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.dm-launcher-enter,
.dm-launcher-leave-to { opacity: 0; transform: translateY(12px) scale(0.98); }

@media (max-width: 768px) {
  .dm-launcher-backdrop { display: block; }
  .dm-launcher-panel {
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    height: 82dvh;
    border-radius: 18px 18px 0 0;
  }
  .dm-fab {
    width: 52px;
    height: 52px;
    bottom: calc(16px + env(safe-area-inset-bottom));
    right: calc(16px + env(safe-area-inset-right));
  }
}

.dm-avatar {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dm-avatar img,
.dm-avatar .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.dm-online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green);
  border: 2px solid var(--bg-panel);
}

.dm-info { flex: 1; min-width: 0; }

.dm-name {
  display: block;
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dm-last-message {
  display: block;
  font-size: var(--fs-small);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.dm-you-icon { font-size: 9px; margin-right: 4px; opacity: 0.6; }

.dm-count {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--coral);
  color: #fff;
  font-size: 10.5px;
  font-weight: var(--fw-black);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 3px rgba(255, 90, 69, 0.18);
}

.hdr-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  margin-left: 6px;
  border-radius: 999px;
  background: var(--coral);
  color: #fff;
  font-size: 10px;
  font-weight: var(--fw-black);
  letter-spacing: 0;
  vertical-align: middle;
}
</style>

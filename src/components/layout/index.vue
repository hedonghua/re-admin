<template>
  <div>
    <el-container>
      <el-aside>
        <side-bar v-model="collapse" />
      </el-aside>
      <el-container>
        <el-header>
          <nav-bar @change-sidebar-status="changeSidebarStatus" />
        </el-header>
        <re-tab />
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import "./index.styl"
import SideBar from "./sidebar/index.vue";
import NavBar from "./navbar/index.vue"
import ReTab from "./re-tab/index.vue"
import { onMounted, ref } from "vue";
import { getUserInfo, UserInfoData } from "@/api/login"
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();
const collapse = ref<boolean>(false);
const changeSidebarStatus = (_collapse: boolean) => {
  collapse.value = _collapse
}
onMounted(() => {
  if (userStore.user?.username) {
        getUserInfo(userStore.user?.username).then(infoRes => {
            const userInfo = infoRes.data as UserInfoData;
            userStore.setAuthorization(userInfo.roles, userInfo.auths);
        })
    }
})
</script>
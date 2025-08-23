<template>
    <q-layout view="lHh Lpr lFf" class="full-height">
        <SearchHeader/>
        <q-page-container>
            <q-page class="login-page">
                <!-- 背景层 -->
                <div class="bg"/>

                <!-- 内容容器：自适应居中 -->
                <div class="container">
                    <div class="glass-card">
                        <div class="header">
                            <q-avatar size="56px" class="brand-avatar">
                                <q-icon name="lock" size="32px"/>
                            </q-avatar>
                            <div class="title">登入</div>
                            <div class="subtitle">使用你的邮箱登录以继续</div>
                        </div>

                        <q-form ref="formRef" @submit.prevent="onSubmit" class="form">
                            <q-input
                                v-model="form.email"
                                type="email"
                                label="邮箱"
                                label-color="gray"
                                dense
                                color="white"
                                clearable
                                :rules="[rules.required, rules.email]"
                                autocomplete="username"
                                standout
                                class="q-mb-md"
                            >
                                <template #prepend>
                                    <q-icon name="email"/>
                                </template>
                            </q-input>

                            <q-input
                                v-model="form.password"
                                :type="showPwd ? 'text' : 'password'"
                                label="密码"
                                label-color="gray"
                                dense
                                :rules="[rules.required, rules.min8]"
                                autocomplete="current-password"
                                standout
                                class="q-mb-sm"
                            >
                                <template #prepend>
                                    <q-icon name="vpn_key"/>
                                </template>
                                <template #append>
                                    <q-icon
                                        :name="showPwd ? 'visibility' : 'visibility_off'"
                                        class="cursor-pointer"
                                        @click="showPwd = !showPwd"
                                    />
                                </template>
                            </q-input>

                            <div class="row items-center justify-between q-my-sm">
                                <!--                        <q-toggle v-model="remember" label="记住我" dense/>-->
                                <q-btn flat label="忘记密码？" color="white" @click="onForgot" size="sm"/>
                            </div>

                            <q-btn
                                type="submit"
                                label="LOGIN"
                                color="primary"
                                class="q-mt-md submit-btn"
                                :loading="loading"
                                :disable="loading"
                                unelevated
                                no-caps
                                padding="12px"
                            />
                        </q-form>

                        <div class="footer">
                            没有账号？
                            <q-btn color="primary" size="sm" label="注册" @click="onSignup"/>
                        </div>
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import {ref} from 'vue'
import {QForm, useQuasar} from 'quasar'
import SearchHeader from "components/SearchHeader.vue";

export default {
    components: {SearchHeader},
    setup() {
        const $q = useQuasar()

        const formRef = ref(null)
        const form = ref({email: '', password: ''})
        const remember = ref(true)
        const showPwd = ref(false)
        const loading = ref(false)

        const rules = {
            required: (v) => (!!v && v.trim().length > 0) || '必填项',
            email: (v) => {
                if (!v) return '请输入邮箱'
                const ok = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/u.test(v)
                return ok || '请输入正确的邮箱地址'
            },
            min8: (v) => (v && v.length >= 8) || '至少 8 位密码'
        }

        function fakeLoginApi(payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload.email === 'demo@example.com' && payload.password === 'password123') {
                        resolve({token: 'demo-token'})
                    } else {
                        reject(new Error('邮箱或密码不正确'))
                    }
                }, 800)
            })
        }

        async function onSubmit() {
            const valid = await formRef.value?.validate()
            if (!valid) return
            loading.value = true
            try {
                const res = await fakeLoginApi({
                    email: form.value.email,
                    password: form.value.password,
                    remember: remember.value
                })
                $q.notify({type: 'positive', message: '登录成功'})
                console.log('token', res.token)
            } catch (e) {
                $q.notify({type: 'negative', message: e?.message || '登录失败'})
            } finally {
                loading.value = false
            }
        }

        function onForgot() {
            $q.notify({message: '跳转到找回密码页…（示例）'})
        }

        function onSignup() {
            $q.notify({message: '跳转到注册页…（示例）'})
        }

        return {formRef, form, remember, showPwd, loading, rules, onSubmit, onForgot, onSignup}
    }
}
</script>

<style scoped>
/* 页面基底：占满屏幕 */
.login-page {
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

/* 背景层 */
.bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(1200px 800px at 10% 10%, rgba(76, 175, 80, 0.2), transparent 60%),
    radial-gradient(1000px 600px at 90% 20%, rgba(33, 150, 243, 0.18), transparent 60%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1020 100%);
    background-blend-mode: screen, screen, normal;
    background-size: cover;
    background-position: center;
    filter: saturate(1.1) contrast(1.05);
}

.container {
    position: relative;
    height: 100%;
    display: grid;
    place-items: center;
    padding: 24px;
}

.glass-card {
    width: 100%;
    max-width: 420px;
    padding: 28px 24px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
}

.header {
    text-align: center;
    margin-bottom: 10px;
}

.brand-avatar {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
}

.title {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    margin-top: 10px;
}

.subtitle {
    font-size: 13px;
    opacity: 0.8;
}

.form :deep(.q-field__control) {
    border-radius: 14px;
}

.submit-btn {
    width: 100%;
    border-radius: 14px;
    font-weight: 600;
    letter-spacing: 5px;
}

.footer {
    text-align: center;
    margin-top: 14px;
    font-size: 13px;
    opacity: 0.95;
}

@media (min-width: 1280px) {
    .glass-card {
        max-width: 460px;
        padding: 36px 30px;
    }

    .title {
        font-size: 24px;
    }
}

@media (max-width: 360px) {
    .glass-card {
        padding: 20px 16px;
        backdrop-filter: blur(12px) saturate(130%);
    }
}
</style>

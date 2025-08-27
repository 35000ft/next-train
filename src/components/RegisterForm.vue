<template>
    <q-card style="width: 90vw; max-width: 400px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">加入<b style="color:var(--q-primary);">「下一班車」</b></div>
        </q-card-section>

        <q-form @submit.prevent="onSubmit" ref="registerForm">
            <q-card-section>
                <!-- 邮箱输入框 -->
                <q-input
                    v-model="form.email"
                    label="电子邮箱"
                    type="email"
                    :rules="[rules.required, rules.email]"
                    clearable
                    autofocus
                >
                    <template #prepend>
                        <q-icon name="email"/>
                    </template>
                </q-input>

                <!-- 用户名输入框 -->
                <q-input
                    v-model="form.username"
                    label="昵称"
                    :rules="[rules.required, rules.username]"
                    clearable
                >
                    <template #prepend>
                        <q-icon name="person"/>
                    </template>
                </q-input>

                <!-- 密码输入框 -->
                <q-input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    label="密码"
                    :rules="[rules.required, rules.password]"
                    clearable
                >
                    <template #prepend>
                        <q-icon name="vpn_key"/>
                    </template>
                    <template #append>
                        <q-icon
                            :name="showPassword ? 'visibility' : 'visibility_off'"
                            @click="showPassword = !showPassword"
                            class="cursor-pointer"
                        />
                    </template>
                </q-input>
            </q-card-section>

            <q-card-actions class="q-gutter-md row justify-end q-mt-md">
                <q-btn label="取消" color="grey" flat @click.stop="handleClose"/>
                <q-btn label="注册" type="submit" style="padding-left: 15px;padding-right: 15px;" color="green"
                       unelevated/>
            </q-card-actions>
        </q-form>
    </q-card>
</template>

<script>
import {ref} from "vue";
import {useQuasar} from "quasar";

export default {
    emits: ['update:modelValue', 'close'],
    setup(props, {emit}) {
        const formRef = ref('registerForm')
        const form = ref({
            email: '',
            username: '',
            password: ''
        });
        const showPassword = ref(false);

        const rules = {
            required: val => !!val || '此项为必填',
            email: val =>
                /.+@.+\..+/.test(val) || '请输入有效的邮箱地址',
            username: val =>
                /^.{3,20}$/.test(val) || '用户名必须为3-20个字符',
            password: val =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(val) ||
                '密码必须至少包含8个字符，且包括大写字母、小写字母和数字'
        };
        const $q = useQuasar()
        const onSubmit = () => {
            // 校验表单
            if (formRef.value.validate()) {
                // 模拟注册逻辑
                $q.notify({
                    color: 'green',
                    icon: 'check',
                    message: '注册成功！'
                });
                // 清空表单
                form.value = {
                    email: '',
                    username: '',
                    password: ''
                };
                emit('update:modelValue', false);
            }
        };
        const handleClose = () => {
            emit('close')
        }
        return {
            form,
            showPassword,
            rules,
            formRef,
            emit,
            onSubmit,
            handleClose,
        };
    }
};
</script>

<style scoped>
/* 自定义样式 */
</style>

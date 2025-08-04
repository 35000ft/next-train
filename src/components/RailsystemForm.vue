<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ id ? '编辑线网' : '新建线网' }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">

                <q-input
                    v-model="name"
                    :rules="[val => !!val || '名称不能为空']"
                    clearable
                    required
                    label-slot
                >
                    <template #label>
                        <span>名称 <span class="text-negative">*</span></span>
                    </template>
                </q-input>

                <q-input v-model="abbrName" label="类型简称" clearable/>

                <q-input
                    v-model="code"
                    label="线网代码"
                    :disable="!!id"
                    clearable
                />

                <q-input v-model="enName" label="线网英文名" clearable/>
                <q-select
                    v-model="category"
                    :options="categoryOptions"
                    :rules="[val => !!val || '类型不能为空']"
                    required
                    label-slot
                >
                    <template #label>
                        <span>类型 <span class="text-negative">*</span></span>
                    </template>
                </q-select>

                <q-select
                    v-model="status"
                    :options="statusOptions"
                    :rules="[val => !!val || '状态不能为空']"
                    required
                    label-slot
                >
                    <template #label>
                        <span>状态 <span class="text-negative">*</span></span>
                    </template>
                </q-select>

                <!-- 语言选择 -->
                <q-select
                    v-model="language"
                    label="语言"
                    :options="languageOptions"
                    :rules="[val => !!val || '语言不能为空']"
                    clearable
                    required
                />

                <!-- 时区选择 -->
                <q-select
                    v-model="timezone"
                    label="时区"
                    :options="timezoneOptions"
                    :rules="[val => !!val || '时区不能为空']"
                    clearable
                    required
                />


                <!-- logo 文件上传 -->
                <q-uploader
                    ref="uploader"
                    label="上传 Logo"
                    url=""
                    :auto-upload="false"
                    accept="image/*"
                    max-files="1"
                    @added="onLogoAdded"
                    :hide-upload-btn="true"
                    :file-list="logoFile ? [logoFile] : []"
                >
                    <template v-slot:header>
                        <q-btn color="primary" label="选择文件" @click="$refs.uploader.pickFiles()"/>
                    </template>
                    <template v-slot:after>
                        <q-img
                            v-if="logoPreview"
                            :src="logoPreview"
                            style="max-width: 120px; max-height: 60px; margin-top: 8px;"
                            :alt="'logo预览'"
                        />
                    </template>
                </q-uploader>

                <!-- 编辑时显示默认车站ID -->
                <q-input
                    v-if="id"
                    v-model.number="defaultStationId"
                    label="默认车站ID"
                    type="number"
                    clearable
                />

                <q-btn label="保存" type="submit" color="primary"/>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {createRailsystem, updateRailsystem} from 'src/apis/railsystem';
import {RAILSYSTEM_CATEGORIES} from "src/models/Railsystem";

const props = defineProps({initial: Object});
const emits = defineEmits(['saved']);

const id = ref(null);
const code = ref('');
const name = ref('');
const abbrName = ref('');
const enName = ref('');
const language = ref('');
const status = ref('PRIVATE');
const timezone = ref('');
const category = ref('');
const logoFile = ref(null); // 上传的文件对象
const logoPreview = ref(''); // 预览图片URL
const defaultStationId = ref(null);

const formRef = ref(null);
const uploader = ref(null);

// 语言选项示例，按需增删
const languageOptions = [
    {label: 'العربية', value: 'ar'},     // Arabic
    {label: 'বাংলা', value: 'bn'},       // Bengali
    {label: '简体中文', value: 'zh-hans'},          // Chinese
    {label: '繁体中文', value: 'zh-hant'},          // Chinese
    {label: 'Čeština', value: 'cs'},     // Czech
    {label: 'Dansk', value: 'da'},       // Danish
    {label: 'Nederlands', value: 'nl'},  // Dutch
    {label: 'English', value: 'en'},     // English
    {label: 'Suomi', value: 'fi'},       // Finnish
    {label: 'Français', value: 'fr'},    // French
    {label: 'Deutsch', value: 'de'},     // German
    {label: 'Ελληνικά', value: 'el'},    // Greek
    {label: 'עברית', value: 'he'},       // Hebrew
    {label: 'हिन्दी', value: 'hi'},       // Hindi
    {label: 'Magyar', value: 'hu'},      // Hungarian
    {label: 'Íslenska', value: 'is'},    // Icelandic
    {label: 'Bahasa Indonesia', value: 'id'}, // Indonesian
    {label: 'Italiano', value: 'it'},    // Italian
    {label: '日本語', value: 'ja'},         // Japanese
    {label: '한국어', value: 'ko'},          // Korean
    {label: 'Norsk', value: 'no'},        // Norwegian
    {label: 'Polski', value: 'pl'},       // Polish
    {label: 'Português', value: 'pt'},    // Portuguese
    {label: 'Română', value: 'ro'},       // Romanian
    {label: 'Русский', value: 'ru'},      // Russian
    {label: 'Español', value: 'es'},      // Spanish
    {label: 'Svenska', value: 'sv'},      // Swedish
    {label: 'ไทย', value: 'th'},           // Thai
    {label: 'Türkçe', value: 'tr'},       // Turkish
    {label: 'Українська', value: 'uk'},  // Ukrainian
    {label: 'Tiếng Việt', value: 'vi'}   // Vietnamese
];

const statusOptions = [
    {label: 'PRIVATE', value: '0'},
    {label: 'PUBLIC', value: '1'},
    {label: 'CLOSED', value: '3'},
]

const categoryOptions = RAILSYSTEM_CATEGORIES
// 生成时区偏移选项
const timezoneOptions = ref([]);

function initTimezoneOptions() {
    const arr = [];
    for (let i = -12; i <= 14; i++) {
        const sign = i >= 0 ? '+' : '-';
        const absHour = Math.abs(i);
        const hh = String(absHour).padStart(2, '0');
        arr.push({label: `${sign}${hh}:00`, value: `${sign}${hh}:00`});
    }
    const specialOffsets = ['+05:30', '+05:45', '+09:30', '-03:30',];
    specialOffsets.forEach(off => arr.push({label: off, value: off}));
    arr.sort((a, b) => {
        const toMinutes = s => {
            const [, sign, hh, mm] = s.value.match(/([+-])(\d{2}):(\d{2})/);
            return (sign === '+' ? 1 : -1) * (parseInt(hh) * 60 + parseInt(mm));
        };
        return toMinutes(a) - toMinutes(b);
    });
    timezoneOptions.value = arr;
}

initTimezoneOptions();

onMounted(() => {
    if (props.initial) {
        id.value = props.initial.id || null;
        code.value = props.initial.code || '';
        name.value = props.initial.name || '';
        abbrName.value = props.initial.abbrName || '';
        enName.value = props.initial.enName || '';
        language.value = props.initial.language || '';
        timezone.value = props.initial.timezone || '';
        category.value = props.initial.category || '';
        defaultStationId.value = props.initial.defaultStationId || null;

        if (props.initial.logo) {
            logoPreview.value = props.initial.logo;
            logoFile.value = null;
        }
    }
});

function onLogoAdded(files) {
    if (files.length === 0) return;
    const file = files[0];
    logoFile.value = file;

    // 生成本地预览
    const reader = new FileReader();
    reader.onload = e => {
        logoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function submitForm() {
    if (formRef.value) {
        const valid = await formRef.value.validate();
        if (!valid) {
            return;
        }
    }

    // 这里的logo上传逻辑需要你自己实现，示例暂时直接传logoPreview（base64或旧URL）
    const data = {
        id: id.value,
        code: code.value,
        name: name.value,
        abbrName: abbrName.value,
        enName: enName.value,
        language: language.value,
        timezone: timezone.value,
        category: category.value,
        logo: logoPreview.value,
        defaultStationId: defaultStationId.value,
    };

    try {
        if (id.value) {
            await updateRailsystem(id.value, data);
        } else {
            await createRailsystem(data);
        }
        emits('saved');
    } catch (err) {
        console.error('保存线网失败', err);
    }
}
</script>

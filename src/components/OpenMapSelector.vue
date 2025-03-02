<template>
    <q-popup-proxy @before-hide="handleClose">
        <q-banner style="width: 90%;">
            <div
                style="font-size: 20px;font-weight:bold;text-align: center;height: 30px;padding-top: 10px;color: var(--q-primary-d);">
                选择地图服务提供商
            </div>
            <div class="q-pa-md" style="max-width: 350px">
                <q-list>
                    <q-item clickable v-ripple @click="handleOpen('google')">
                        <q-item-section avatar>
                            <img style="width: 36px;height: 36px;" src="public/icons/google-maps.png"
                                 alt="Google Maps Icon">
                        </q-item-section>
                        <q-item-section>Google Maps</q-item-section>
                    </q-item>
                    <q-separator spaced inset/>
                    <q-item clickable v-ripple @click="handleOpen('amap')">
                        <q-item-section avatar>
                            <img
                                style="width: 36px;height: 36px;"
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAAAXNSR0IArs4c6QAAF8pJREFUeAHtW2mUHNV1vlVdvU3PopHUGmnQMggQoA2xGWwWDY53O3ESTBacnDj+YTtO+JOc2Md/jHSynJDjYBI7OPExB+MFY5NzEjvEy4mAETGLkMTOsEQWAxIgGEmzdvdMd1e9fN99VdXVPa2ZkSAx8fEbVb3tvvvu/d69972qLon8Mv0SgfkQcObrPFGfMcYZl8PbfTGbgsBfLRKsdMXxTkTP9qx0T3W6y6ZOQJOq+n7fCfoW2xw4xhwNjDnsue7BVCr1E8dxZhY7OKI7KUBG6nuuLZmJz02bY+dWTTkVMVlMvia1TdalLmhL6geBjJVKbftOtdF1HANQXsL1ja5s9vOL5bMoQF4wD2+f9o/eNhEcWUvrWCzzJN3/NSDJuWExkxnP+2whl/unZHu7stuuMdl2wL//C6/Wnrl33H913amCkeT38yjXg6C7XK1+ZbJSuW8hHeb1+2fr995zxH9ucCEmPw8lT2XO2VrtCuhyGNdGxJeJdjxOaCHP13f/y6h/8KpfFDAi5av1ev9EpfJYVG/N2wJywH/wM68HB3+zlfgXpV6r1wemKpWftNNnDiDHzb6eY/7IXxkTnFLwbDfJW7Fttl5/d2lm5v2tss0BZNSfvh1b6ryxpZXJW7X+/Jgr33my/emAoQDB9pZW2ZsAoXUcDw69r5Xo/1v9wJgjf/SfOfnM91NycKo9INQJ8WRVeXb2d5L6NQMSVP+sbqpNbUnit3r54Lgjf7IrJ5d9uyCHDtZkuJqRbSuDecWGlVyXJGhyjdlg6reSnVHZmKiE/BQjC1kk2SQ4anvbvkSjM8+8L046cuPerHz3GU98jLk8XZKfOTkZm3Vk2wo/OdWcMk7JFyYbmwApm4nTk51v9fKhKUdu2puRbw+nFQjKe2WmJE+XMnIsnZKlOSOndSZQbaNQ3feziCercC55ld1NgNRkJh2NARGK4bLMszoRPXOOsaRtBpBdk2ygxbI3NSWZsZxgk7TSV0oAYl9GvvV0WuoJj7gCYOw55Mpsn1Xj/L5EZyvvRL0ush5VBSSOF1Cm2zc1FcFOjiJrCaESPGyRhJGiyJ1oQDRuvhy0Ok9iPBtOOB06Xi078rn7snLxbQX5+pMNMDhmew5gPGckWJWPxTxvAXeJCB3fXxuVkxay1AKBrhapktaiXVH/CRw75pNgxDbbTgRsooVoYhYybvSijWOQvQYgvrQ/Lbc9lZFqS0jgsCvzJbn/EV8yG7uknDCKbYu0kCAIloGNpggQZ4ZvDmLBwl5kVgmsvQrcaI9KDUXbEzSNUwUbdJY33qZAiSCgC0GExIDXK458+ZGMWsMM7Lo1kdP2Qlnue8CX3MYOKbc8iJ9XbEGvlUGbOgAJueTQW21QRMIm5Is7KbxI7G3R4tr+hr4xvRbYjiHtuh2w03hCwHAdBRA3P5qWW5/MSKUNEOTH2a8EGEP316XrrKxMpaO1Za/I8ryR/gUCqqVsvlsu1C9MkXuo4Anpmy0BHfyX6KcmCqLim+ywjAMQt38YgHmQHNcYrPTmRzNyyxMZKdciiebmSTA6T/OkVMjOIVqsu7QO9JJhXhWCZE2KYgRN2kodghDpqyBElhI1hlOg2YJr6wZmwCt2idjXXTkGx/+bBzLyNVhEKWGlIaemzMU0g51luee/6pLvdaTa1xHK10QmW+EunD+er7n7hLXYzmZnwrEJvZqAiPQGKxO7TEiMDO8yCaX+6Wy68A1mDiyHV3IBxmdF/mGvyE0POzKFU+VCKQlGGkaRGihIJQa2ebQ9kNmdrHWBmymbaxaQneJkP4uOhvxAPawgixia2FJsXwDtXHozXA4vmS1ntRo2hHVtteeNSPZJWMGX9hr5+4dFJgDKYlIK7Aa7ynL3fXWdqfOcvIyZxCq1MDmPOwxFgCgQKdahhWxO1ROAsYPNYVDl4Oi1qRPNp0raCgwfxNYSIhDwqgBNITHRw0U+pGOi6RLfiZqRm/fDImAV49zVFpkUjO6S3L3b7hpLz8nKMSc+Q87hUuwwsqqgAlgRVCcVaw5ta4O3I2yZnZ2lh0c6WFjDDcgqaF2Cm1JkMRyqANJKOFZRsCCEiGjzTD0tX31khdwKII5XwgkXmaXAerAHlnGvBaMHQXSSQXSeHfW8YqBLEUIS66R13JLyt4qhLvP0xjuhxTUNnaBYFIyUCZeXBXCKmNFS6DBhh4KhlhUSkHym7skPHj9bvrt/k0yU5+4ErcK01j2w394DywjBKCxxxe/PS22eHYg8tvUxoLKEWyQwq2FiX5tm7fViMFBVJgkwbKCEVAkGMRCcELTWqiIXYZsjs/WU3PXEWXIHgBgr0RdPPtEykmCkEXNzZ+XlmH26mJfhVhzZrWSh1Sa1pwFD9hOBAguBZSAhtpEUyGmGXYMNBAN126Q7Seg42s4u7kQaUTBuFit311Nnyx17N8nxUuOZgnxPJjFmbMfWGlkGxy7bnJMjtRO/7EnyP28FwzcDeeTmiRUlIfVRUBqewGYmdZnRolU51Dti0wIGe6E6oQVOBMwgyuO4hecLV3701Jly+8Ob5dgbAIICEYwrCiW5575GkCienZbXzcLbMsczoK6MAipWbH5QIo050iZPDWRIQdNe6KnoWctgDSrTFJgIAiyBWzItyQcQP3zyTPnO3i0yOt1had7AnWBc3oHj+E8bYHSvSMlUd16CBeJGNO02WEfsDhQ7snDkWo0ImaOBtMnkjQ4NOVNdXeiyL44YGPUAZR8wGucRBYOW4aqb/GT4DPnWni3y+lQhye+UywTjslxZduPZJEpZsDZr8zKzSDA4Th/5ISvjnxuehSKA4jyaIMzxtBu3wGUGQyisGxAHhZKWATqtcgKU/MCTXcOnyzcBxJHJzpjJGy0wgL4dr/3ue7BhGdSlcHaHHK+j8yTSFj7hYiwXNQJALRs6oNlaBAtR0nJjDm8QHa/gYlBlRKBLMBEIBQP3Gqzi7mfPkG8+tFVenXjzgOA8tIy3p2fkp3saYLB9CQ5fx7EAJ5u4w9jd0YKi46kSlNF4Qv2sYq2slcp75XlxxnqHneqGMxyTtiNJz7hBhHc9tx5AnCeHx7paGbzhugWjAjCafaKrH4evPM4tDUte1Fx9CKYrEcooNx8d9OGSZSTdPaFTnGLzQYsaCAkd7DIMHfmNkp2Fjehp2ALBzgOvL5U79m3+XwPjkhTAeLgZjFwPnmBX5pvelcZKLFCgu6hasAI+gDrR85QqbwfHOCTBafB13LGDw870iwccyWJFQE2GdryRM1ccl3/+6H/In7/nASniXPBmJcp5sVORB/Y1g+FhQVLrOmQ2erA8yQl5/lD5OU5dA/qwgdFDkWI5kbQvrGtZz94b5ZLXPGtLRFYHMmcTj2ZG3n3OQbn1Yz+Qj1/2mBSyzUok2C+qSDe52FTkoUfm8smdmZOSu7jDV7vJthTrKr8uqy4u9Ij+WLfohDq240Dv2cSOAe3VwQBED19EOETWcV3JpAL57QuflVt///vyG+c/L557kg4OblT1Ar8sex6bC0ZhTVqms4s7fKmwbW5bluOhDmJTb11X0rBAPdChJxGqlUwhSNoEWlfdZYCvU/EzVziQgy2aeGwnc16qfyBd+bp84rL98tXf+7FcedZLSdbzlgnG+QBj7xONc0Y0INvryszyUz/qkw8DajFvD2WKCnUgGmFOfVSPEADVT8FpRsitvHbYtmSyOHeAAZIdg9BLfrAORRmbcvQGjZ7W1zkln33vw3LjR3bJ1tNGddyJbi4ONxurx2Tfk3PB8DI476wpxL+8nYjHQu18ZUiDVw0gqAKAFlVOG1HSfzYPe+aw9QZkUBsxxrwj8wda1piGGBKEL358H9EbwNiDGqwGBNzreZ1/misfuTqQe0eM/PX9jjx3rHkOxoytlYo8+uzcFzroEvf0vFSj3aB56EnVLlntydLuTrg7VAVjnlLJn5dNfNAL6yjYXvvwB71iqbH8NtWqkcvQQsIARJTUXIA8RpGJ7UOZloM647oD69m+zsgPrzVyw6/gLBCe3QjG5nIZYMy1DM6aXpOVav7kD19W4ub7tpUQVhO1hZyxlVggrOlEkDBnIq0tRXcFZGI0dBttDQdpFlITch3JSa1ZEhgCQSvhns8eB/nV5+Iw99FA/vRSI1sqZXn8ufZgeL2e1Jad/EsjFbHNbdsKK6u+3acpQzY1Fcit0lGHUA2ltORzOLkygLbVYXtIlKTVuIIGGoq6ELmCOR+Iop8VaCWcTXdquFkWu/gnLzBScNk+N7lZANmfs4s2t/ukW/pxiOYPU1wcm7BoXKjwssA0LD9uT8y0Y+dOVdu6zBrsMlU1gwQJimETGSi8CgzK2h6CEnbRRHVVAAwB4t97L2rjDpwR70WDtJ26ecJTq23jR+G0CCbIw7kb4Fg3V20pa2QmmluQ9Dwg17Oz8TlE3nM68B2nNnKzaQRUWgKV50QBdgNaAtjjyxTGdaWNch+0AI8frVCw7ZuM8EkWzXFyCzUJurvj+ptRWLVU5ImyjRUpnjEhg/4OxMCqSCAPFzXCjfNqF+6dKVkRyREvIV4ALpmasUyJriKMU6NPJcGVG04TIKhHgPicDED5IDIaVyz7DM5ZF21wZM+zRMgKkHnoGalPrZb6lrU4qb05VlLB65y7p+giUJxuqtNBXd1yOK8FJsQkBCIUCLQXdMp6FRA3V0ZwPxRVW/NQEQuz1cg2tRK21C32bHzntkRXtSputSaZR1+Q3L/ukf7adKLz1IuremmZ0Xi7qFbrqJF5KFNEiNyGgmiczXWJemZX25F6pweGKazbGir4Zx+jw0VoUCqJS3vERA048H50M9wmfDxxq40HxHVFT+76ZF7+8QOBrHoDHtRdcKQDn04pIrpwtAyIo4rTVUJdkEVytQOCVCSNbTadzuLbbzJmFwfb4fYtPJTEZPZiL+pUXAWIcqySjmNvyAR5T8GVi8/iGEyGAxpTJp+WL39xk3h4/3L5GiN/92Fftm8JpOWLBqVd6LZqaSSwldf+7oxRqIaYaKU9CHYMzksq2E7sNO6I+ozI96bSz0JBatdQPlJMg6I9mFFARBTc8CQMi9BJcXP1oGZpQtEsH1C/c5ttcWYsIH/xl+dKX18WXCyYaUj09nOMfOJ9gZy7NgKTMy2cVum3P5b/wtSNhab8UXID/0BclhCQVxD8Uy6PVkiMoEyoqaIcCwbss3zQQFsEHY/I+M86ei5Rq2IXr3CJOOrKrY66jVuqyAevXidXXrZEeXEKXTkASt5deNv14UsDufYqPKj1sHfh1B9/DAVaXR1kIXeK3T419yAQD0d0br4P8WME1UOHqdw4O1QZMoWyOgkm4qmUZbLSWEHCsE4R2A9A0QiQMFTdSZGB2+BB9qIzcaRflZPPf2YdeFg+pOZFMHSesLK2aOTj7w3kXecbyc59BCJ1nLjlxoHCrlbct5gCz4gTE0cejWjdzmlIisTAiueT3bGSYG6BoXIggLWoR+lIuEa4GrQOJmJB82JdXQH9bNN+5L9+oZGvf2Wz0trYo0XlrQ9i3IKVAV51w/r4HHTxWYF86oN4ODxdRbQDEvce/EzRwVcoLd2R3C3NiZGNYn9aXrrzwQfjz3QgxTAMZEQpZtz0TdRPD16h2zg4kdn4AGBwLiEOIEEbtg4WIE0MAiVDmxqKulRkCUbedWlG+pamEMXhYiCILgWHTCk94hDPuWTC4USrkA3kQ5cY+cP3YDdKuge6ta4LQkE4AEllmlO0DfE9pEW9JyX/Fjej4Pau32he66ur23zx0SP7MmnvlVAvZBioCFnrsFYCgVUI5KoIAIMQKbSpK+BwRNfh9kXZaEkEjP0Umhkp2a/gsKavDQmejV0Eg68gCBZF55j+pY6C8oG3GWyz5BUCQgrKgdE21y5b50B22Zt2RPGFtN14vpw1smPTNdcoFQkol1i3GVG3qXnZT8FkIR3FtUI5GjyVVIW3SvKgmcIFukhpHDjUYcBeQeEQlMnHKo8c2sJtoSTBYc6dyVeledx2ceEf6tzBADZ9h4kZeF0AD//0hwKcgPHZNuJHvGghWTyhDuI425F006hrfVpuuXOXNJ0O3f4pMb3rxewJreQLj7y6C1bymFWE01FwKk2hUePOQyEpdfKrFQXFzg9VdLEIAo/SrNMH6HpsI4hqIQSOdV1JhVJfRKllBD7mgVuCr6KB6UjmOCnBMUbef7HI6atoa+zFPSKDrKGhoY1nI3Y0J/LH19+TNz0+dF2y5/rrrzfuUNiStJKhasdVmXTquFpJyI+T0vS5wrRnrizjiAqEdjVugOUhONrVoCh8uMMYXOynZdC9mJQXrYtjqQRBR90AeD45u/qQRhdi3GIOOg6mkpRBE3IFjN1kTLfDXW/o0zYS2j4dhTY8zNXXpZ0r2JNMpOJCIe2XpJUMT8jsUfGuwP93nVUFVAAIRBOG0DoxVop1Wg1pKKwFJcCZA7+Aoc4TOydhssBQaQgdjuNYLmcAEOyygj8B5SOnflBHgPCRnQKPubSNeuqEJMLFMoss49IJVRLFg1LFdOjmNrshLx+74XEZLg4OclBTcouDYp6/EHsiUud01eiOMyLytfHXX3jZFDZ56fQoYwT/1HVgylRYXymq6XNCKIK7ykk6PCETgBSUU7AIAPsxSwqWwPHaj05alILFTYuWguV1DD+fBUgKHAACfwtvaB2YiE/eypMTaCkcb+Ny1II+yg0azL0kJdXNWfnVf/9v+R46RO7Ue9PN1cYhRPELGUuw40zZHaenvtp8e0peufHx0hl4zrkXfg6WxI0C++LhAzADxTkXlaQusRtQSCgDCo0PHmJBCsMZelQ5sGHwpKr2skBQMroMAbZuBDoMUsugK4GHtqsUpEaiVASOlmerqKMRtPxTebGip2flwDJ/dtM3dg3vkv37OTJMQGVnVI5cZrfI0BAb98uad5wZ7OkDJ9R78ENYbd3y+nU/mvq1CT93adrzhuEykAtTQwgFhXMi2dMphQIQQIlAUVp1M/ajgRZD8DwqSeXAg3z0ovAYozEFgOo5BUCaOgAK8bJgkDHnIQ+dROdiXb2Gc4OCtJjGrMmaIxd1OL97z12y5fYnDx3iovdvoEcMgUqkseXu1Dq8lXZTxDUodJ0N+8XpnB6G63Q4AyMDcLrDiC+pYMc948PFYvGSS3qP9Vy1vuuP8SvOh+H9ffCaQt0P8OsKjZrfkFizdunvkIzvZG0QdOqoVNQBILke/6koyl5KMrm0k6VE1howhq/oaGkZjAhPsFz1CAzytiBgAUCHqmQdp55xTRnvco93pszdiEM33l+RFw89JRoKijyV493YEGiLo4PhUqKCtAM7DHOPCD0NTEZ3D4HnoPQPcqk2ythBCUZGRtyBgQHUD4usl2D04Ki7R4oTd/344A2F4vq/rZYmnN6i65ZnHXdmrORmu1c4bu2oW08VnKpXcd266wZuzkm7s0665jp+fsqplehc0NWfdjOCt8MKAxrw8QF+PRQ3nTVBB8xmElh42aCWNiYV8IXHEbhFj18tVUyhM+dX/Q5TGh3FYuXqaXjTWDUIMkd7TKn2gikW1/tT1ddMfllgCvgPNiMjqyXfN2B6V0A3ussGfvLARGOwHx1qFbfUoLPDWfFpkdLogJT3iTOCxi3vEKnP4EOanx116pVJZ6ZrrXTjv8qnlosce3nGkeJqUxs96MwuWSU+PkleXug2Dt5aVafHpZwpYKU6TMYr8cWHyeCH7VrdkXq+03hVCJROmbyXCtxsB8JzDfahP2IEJmWCdL7gu34NtpENvFQBX295xjVHJeiqBfVqpy9+2XQsywfV4wBjfARgdDfAqAOMqTHTlc0EY5Ml6TrNN4U+3/SMrjaPkVaWmHwvYmVXP6xlSArlAbgLXvruJBQ7ZWhwkAUAMrjDkd0iFhSJQVmW3e/0rNlsJktLJDM65Kzs2irBywBlPT7IffkQQNlg8pXjkunodWawQpMOlrirKj3ZpUF1eho+XMM+UZOcswy/WJRMZxoAVCalNjMtMBbj4j/COH7OOGkPj072gl0YU60bt1bHrwBjxst6ASALzETFAD/0Lg/88XFxuoxfWJEPOG+ZlgEwxtG+ZKUfTMGielcWg0Jfl+k50G1GRvCD2NuWBL1d1jr2L+uHu9DqofMm3KD7jusHtc62/wHi3gbpiXrJnQAAAABJRU5ErkJggg=="
                                draggable="false" data-spm-anchor-id="0.0.0.i1.42e51c4ehs6KzU">
                        </q-item-section>

                        <q-item-section>高德地图</q-item-section>
                    </q-item>
                    <q-separator spaced inset/>
                    <q-item clickable v-ripple @click="handleOpen('baidu')">
                        <q-item-section avatar>
                            <img
                                style="width: 36px;height: 36px;"
                                src="data:image/png;base64,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"
                                draggable="false" data-spm-anchor-id="0.0.0.i1.42e51c4ehs6KzU">
                        </q-item-section>

                        <q-item-section>百度地图
                            <span style="font-size: 12px;">* 与实际位置有偏差</span>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </q-banner>
    </q-popup-proxy>
</template>

<script setup>
import {genAmapPositionUrl, genBaiduPositionUrl, genGoogleMapPositionUrl} from "src/utils/navigator_utils";

const props = defineProps({
    config: {
        type: Object
    }
})
const emit = defineEmits(['close'])
const handleClose = () => {
    emit('close')
}
const handleOpen = (mapServiceProvider) => {
    const _config = props.config
    if (!_config) return
    const {location, title} = _config
    if (!location) return;
    let url
    if (mapServiceProvider === 'google') {
        url = genGoogleMapPositionUrl(location, title)
    } else if (mapServiceProvider === 'amap') {
        url = genAmapPositionUrl(location, title)
    } else if (mapServiceProvider === 'baidu') {
        url = genBaiduPositionUrl(location, title)
    }
    if (url) {
        try {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url.url;
            document.body.appendChild(iframe);
            setTimeout(() => {
                document.body.removeChild(iframe)
                if (url.fallbackUrl) {
                    window.open(url.fallbackUrl, '_blank')
                }
            }, 1000);
        } catch (e) {
            console.error('error on open map', e)
        }
    }
}
</script>

<style scoped>

</style>

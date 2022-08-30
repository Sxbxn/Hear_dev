package com.kyonggi.hearing

import android.app.Application
import com.kakao.sdk.common.KakaoSdk
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class App: Application() {
    override fun onCreate() {
        super.onCreate()
        initTimber()
        KakaoSdk.init(this, getString(R.string.kakao_native_app_key))
    }

    private fun initTimber() {
        // Debug 상태에서만 출력
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
    }

}
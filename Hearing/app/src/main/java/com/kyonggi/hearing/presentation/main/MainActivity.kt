package com.kyonggi.hearing.presentation.main

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.viewModels
import com.google.android.material.tabs.TabLayoutMediator
import com.kakao.sdk.auth.AuthApiClient
import com.kakao.sdk.user.UserApiClient
import com.kyonggi.hearing.AppViewModel
import com.kyonggi.hearing.R
import com.kyonggi.hearing.databinding.ActivityMainBinding
import com.kyonggi.hearing.presentation.join.JoinActivity
import com.kyonggi.hearing.presentation.login.SignInBottomSheetFragment
import com.kyonggi.hearing.presentation.main.info.Info
import com.kyonggi.hearing.presentation.main.info.InfoAdapter
import com.kyonggi.hearing.util.Constants
import com.kyonggi.hearing.util.extension.viewpager.ZoomOutPageTransformer
import com.kyonggi.hearing.util.extension.viewpager.removeOverScroll
import com.kyonggi.hearing.util.showToast
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var infoadapter: InfoAdapter
    private var nickName = ""
    val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initViewHolder()

        // 로그인 여부에 따라 확인
        binding.btnJoin.setOnClickListener {
            // 로그인 유지
            if (binding.btnSignIn.text == getString(R.string.sign_out)) {
                val intent = Intent(this, JoinActivity::class.java)
                intent.putExtra(Constants.NICKNAME, nickName)
                startActivity(intent)
            } else {
                SignInBottomSheetFragment().show(supportFragmentManager, SignInBottomSheetFragment().tag)
            }
        }

        binding.btnSignIn.setOnClickListener {
            // 로그인 유지
            if (binding.btnSignIn.text == getString(R.string.sign_out)) {
                logOut()
            } else {
                SignInBottomSheetFragment().show(supportFragmentManager, SignInBottomSheetFragment().tag)
            }
        }

        viewModel.getUserInfo()
        viewModel.userInfoLiveData.observe(this) { userInfo ->
            // 로그인이 안되어있음
            if (userInfo.token == "") {
                binding.btnSignIn.text = getString(R.string.sign_in)
            } else {
                nickName = userInfo.nickName
                binding.btnSignIn.text = getString(R.string.sign_out)
            }
        }
    }

    private fun initViewHolder() {
        val list = listOf(
           Info("Start a Hearing",
            "청각장애인이 원할하게 화상회의를 할 수 있도록합니다.",
            R.drawable.info_image1),
            Info("Sign Language",
                "수화를 실시간으로 화상회의에서 음성으로 내보냅니다.",
                R.drawable.info_image2_hand),
            Info("Converting",
                "음성을 실시간으로 화상회의 내에 자막으로 보여줍니다.",
                R.drawable.info_image3_subtitle)
        )
        infoadapter = InfoAdapter(list)
        binding.infoViewholder.apply {
            adapter = infoadapter
            removeOverScroll()
            setPageTransformer(ZoomOutPageTransformer())
        }
        // TabLayout attach
        val tabLayout = binding.tabLayout
        val viewPager2 = binding.infoViewholder
        TabLayoutMediator(tabLayout, viewPager2) { _ , _ -> }.attach()
    }

//    private fun checkToken() {
//        if (AuthApiClient.instance.hasToken()) {
//            UserApiClient.instance.accessTokenInfo { _, error ->
//                if (error == null) {
//                }
//            }
//        }
//    }

    private fun logOut() {
        UserApiClient.instance.logout { error ->
            if (error != null) {
                Timber.e("사용자 정보 요청 실패", error)
            } else {
                Timber.i("카카오 로그아웃 성공")
                viewModel.clearAll()
                this.showToast("로그아웃 되었습니다")
            }
        }
    }
}
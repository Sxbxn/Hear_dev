package com.kyonggi.hearing.presentation.main

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.kyonggi.hearing.R
import com.kyonggi.hearing.databinding.ActivityMainBinding
import com.kyonggi.hearing.presentation.login.SignInBottomSheetFragment
import com.kyonggi.hearing.presentation.main.info.Info
import com.kyonggi.hearing.presentation.main.info.InfoAdapter
import com.kyonggi.hearing.util.extension.viewpager.ZoomOutPageTransformer
import com.kyonggi.hearing.util.extension.viewpager.removeOverScroll

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var infoadapter: InfoAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initViewHolder()

        // 테스트 코드
        binding.btnJoin.setOnClickListener {
            val test = SignInBottomSheetFragment()
            test.show(supportFragmentManager, test.tag)
        }
        // 테스트 코드
        binding.btnSignIn.setOnClickListener {
            val test = SignInBottomSheetFragment()
            test.show(supportFragmentManager, test.tag)
        }
    }

    private fun initViewHolder() {
        val list = listOf(
           Info("Start a Hearing",
            "우리는 이러이러 해서 만들었고 이러이러한 것을 지원합니다.",
            R.drawable.info_image1),
            Info("Start a Hearing",
                "우리는 이러이러 해서 만들었고 이러이러한 것을 지원합니다.",
                R.drawable.info_image1),
            Info("Start a Hearing",
                "우리는 이러이러 해서 만들었고 이러이러한 것을 지원합니다.",
                R.drawable.info_image1)
        )
        infoadapter = InfoAdapter(list)
        binding.infoViewholder.apply {
            adapter = infoadapter
            removeOverScroll()
            setPageTransformer(ZoomOutPageTransformer())
        }
    }
}
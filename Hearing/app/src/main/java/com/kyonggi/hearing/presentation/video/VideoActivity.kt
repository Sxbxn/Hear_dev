package com.kyonggi.hearing.presentation.video

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.animation.AnimationUtils
import androidx.activity.viewModels
import com.kyonggi.hearing.R
import com.kyonggi.hearing.databinding.ActivityVideoBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class VideoActivity : AppCompatActivity() {
    private lateinit var binding: ActivityVideoBinding
    private val viewModel: VideoViewModel by viewModels()

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVideoBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initListener()

    }

    @SuppressLint("ClickableViewAccessibility")
    private fun initListener() {
        viewModel.isOpenState.observe(this) { check ->
            binding.remoteView.isSelected = check
            if (check) {
                binding.topControlsLayout.visibility = View.VISIBLE
                binding.bottomControlsLayout.visibility = View.VISIBLE
            } else {
                binding.topControlsLayout.visibility = View.GONE
                binding.bottomControlsLayout.visibility = View.GONE
            }
        }

        viewModel.videoState.observe(this) { check ->
            binding.videoButton.isSelected = check
            if (check) {
                binding.switchCameraBtn.visibility = View.VISIBLE
            } else {
                binding.switchCameraBtn.visibility = View.GONE
            }
        }

        viewModel.micState.observe(this) { check ->
            binding.micButton.isSelected = check
        }

        viewModel.screenShareState.observe(this) { check ->
            binding.screenShareButton.isSelected = check
        }

        viewModel.audioState.observe(this) { check ->
            binding.audioOutputButton.isSelected = check
        }

        binding.videoButton.setOnClickListener {
            viewModel.setVideoState(!it.isSelected)
        }

        binding.micButton.setOnClickListener {
            viewModel.setMicState(!it.isSelected)
        }

        binding.audioOutputButton.setOnClickListener {
            viewModel.setAudioState(!it.isSelected)
        }

        binding.screenShareButton.setOnClickListener {
            viewModel.setScreenShareState(!it.isSelected)
        }

        // 화면 터치시 top/bottom hide
        binding.remoteView.setOnClickListener {
            setSlideUpAndDown()
            viewModel.setIsOpenState(!it.isSelected)
        }

    }

    // View visibility
    private fun setSlideUpAndDown() {
        val bottom_slideUp = AnimationUtils.loadAnimation(this, R.anim.bottom_slide_up)
        val bottom_slideDown = AnimationUtils.loadAnimation(this, R.anim.bottom_slide_down)

        val top_slideUp = AnimationUtils.loadAnimation(this, R.anim.top_slide_up)
        val top_slideDown = AnimationUtils.loadAnimation(this, R.anim.top_slide_down)
        with(binding) {
            if (remoteView.isSelected) {
                // Top layout
                topControlsLayout.startAnimation(top_slideUp)
                // Bottom layout
                bottomControlsLayout.startAnimation(bottom_slideDown)
            } else {
                // Top layout
                topControlsLayout.startAnimation(top_slideDown)
                // Bottom layout
                bottomControlsLayout.startAnimation(bottom_slideUp)
            }
        }
    }
}
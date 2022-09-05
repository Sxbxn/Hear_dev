package com.kyonggi.hearing.presentation.video

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.animation.AnimationUtils
import com.kyonggi.hearing.R
import com.kyonggi.hearing.databinding.ActivityVideoBinding

class VideoActivity : AppCompatActivity() {
    private lateinit var binding: ActivityVideoBinding
    // view의 open 여부(테스트용)
    private var open = true

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVideoBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.videoButton.setOnClickListener {
            if (it.isSelected) {
                binding.switchCameraBtn.visibility = View.GONE
                it.isSelected = false
            } else {
                binding.switchCameraBtn.visibility = View.VISIBLE
                it.isSelected = true
            }
        }

        binding.micButton.setOnClickListener {
            it.isSelected = !it.isSelected
        }

        binding.audioOutputButton.setOnClickListener {
            it.isSelected = !it.isSelected
        }

        binding.screenShareButton.setOnClickListener {
            it.isSelected = !it.isSelected
        }
        binding.root.setOnTouchListener { _, motionEvent ->
            when (motionEvent.action) {
                MotionEvent.ACTION_DOWN -> {
                    setSlideUpAndDown()
                }
            }
            true
        }
    }

    // View visibility
    private fun setSlideUpAndDown() {
        val bottom_slideUp = AnimationUtils.loadAnimation(this, R.anim.bottom_slide_up)
        val bottom_slideDown = AnimationUtils.loadAnimation(this, R.anim.bottom_slide_down)

        val top_slideUp = AnimationUtils.loadAnimation(this, R.anim.top_slide_up)
        val top_slideDown = AnimationUtils.loadAnimation(this, R.anim.top_slide_down)
        with(binding) {
            if (open) {
                // Top layout
                topControlsLayout.startAnimation(top_slideUp)
                topControlsLayout.visibility = View.GONE
                // Bottom layout
                bottomControlsLayout.startAnimation(bottom_slideDown)
                bottomControlsLayout.visibility = View.GONE
                open = false
            } else {
                // Top layout
                topControlsLayout.startAnimation(top_slideDown)
                topControlsLayout.visibility = View.VISIBLE
                // Bottom layout
                bottomControlsLayout.startAnimation(bottom_slideUp)
                bottomControlsLayout.visibility = View.VISIBLE
                open = true
            }
        }
    }
}
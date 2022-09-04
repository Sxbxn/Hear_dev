package com.kyonggi.hearing.presentation.video

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.ImageView
import androidx.lifecycle.VIEW_MODEL_STORE_OWNER_KEY
import com.kyonggi.hearing.R
import com.kyonggi.hearing.databinding.ActivityVideoBinding

class VideoActivity : AppCompatActivity() {
    private lateinit var binding: ActivityVideoBinding

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
                    if (binding.bottomControlsLayout.visibility == View.GONE) {
                        binding.bottomControlsLayout.visibility = View.VISIBLE
                        binding.topControlsLayout.visibility = View.VISIBLE

                    } else {
                        binding.bottomControlsLayout.visibility = View.GONE
                        binding.topControlsLayout.visibility = View.GONE
                    }
                }
            }
            true
        }
    }
}
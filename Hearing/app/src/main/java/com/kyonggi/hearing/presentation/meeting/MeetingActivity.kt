package com.kyonggi.hearing.presentation.meeting

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.kyonggi.hearing.databinding.ActivityMeetingBinding

class MeetingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMeetingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMeetingBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
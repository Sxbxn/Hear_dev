package com.kyonggi.hearing.presentation.join

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.kyonggi.hearing.databinding.ActivityJoinBinding

class JoinActivity : AppCompatActivity() {

    private lateinit var binding: ActivityJoinBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityJoinBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
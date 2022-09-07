package com.kyonggi.hearing.presentation.video

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class VideoViewModel @Inject constructor(): ViewModel() {

    // Control 레이아웃에 대한 State
    private val _isOpenState = MutableLiveData(true)
    val isOpenState: LiveData<Boolean> = _isOpenState

    // 화면공유에 대한 State
    private val _screenShareState = MutableLiveData<Boolean>()
    val screenShareState: LiveData<Boolean> = _screenShareState

    // 카메라(비디오)에 대한 State
    private val _videoState = MutableLiveData<Boolean>()
    val videoState: LiveData<Boolean> = _videoState

    // 마이크에 대한 State
    private val _micState = MutableLiveData<Boolean>()
    val micState: LiveData<Boolean> = _micState

    // 시스템 소리에 대한 State
    private val _audioState = MutableLiveData<Boolean>()
    val audioState: LiveData<Boolean> = _audioState

    // 카메라의 전/후면 에 대한 State
    private val _cameraSwitchState = MutableLiveData<Boolean>()
    val cameraSwitchState: LiveData<Boolean> = _cameraSwitchState

    fun setIsOpenState(state: Boolean) {
        _isOpenState.value = state
    }

    fun setScreenShareState(state: Boolean) {
        _screenShareState.value = state
    }

    fun setVideoState(state: Boolean) {
        _videoState.value = state
    }

    fun setMicState(state: Boolean) {
        _micState.value = state
    }

    fun setAudioState(state: Boolean) {
        _audioState.value = state
    }

    fun setCameraSwitch(state: Boolean) {
        _cameraSwitchState.value = state
    }

}
package com.kyonggi.hearing

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kyonggi.hearing.data.model.UserInfo
import com.kyonggi.hearing.domain.repository.DataStoreRepository
import com.kyonggi.hearing.util.Constants
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@HiltViewModel
class AppViewModel @Inject constructor(
    private val dataStoreRepository: DataStoreRepository
): ViewModel() {

    private val _userInfoLiveData = MutableLiveData<UserInfo>()
    val userInfoLiveData: LiveData<UserInfo> = _userInfoLiveData

    fun saveUserInfo(user: UserInfo) {
        viewModelScope.launch(Dispatchers.IO) {
            dataStoreRepository.setUserInfo(user)
        }
    }

    fun getUserInfo() {
        viewModelScope.launch(Dispatchers.IO) {
            dataStoreRepository.getUserInfo().collect {
                _userInfoLiveData.postValue(it)
            }
        }
    }

    fun clearAll() {
        viewModelScope.launch {
            dataStoreRepository.clearAll()
        }
    }
}

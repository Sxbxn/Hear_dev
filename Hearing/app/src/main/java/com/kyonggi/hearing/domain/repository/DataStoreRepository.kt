package com.kyonggi.hearing.domain.repository

import com.kyonggi.hearing.data.model.UserInfo
import kotlinx.coroutines.flow.Flow

interface DataStoreRepository {
    suspend fun setUserInfo(user: UserInfo)
    suspend fun getUserInfo(): Flow<UserInfo>
    suspend fun clearAll()
}
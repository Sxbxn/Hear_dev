package com.kyonggi.hearing.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.kyonggi.hearing.data.model.UserInfo
import com.kyonggi.hearing.domain.repository.DataStoreRepository
import com.kyonggi.hearing.util.Constants
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException
import javax.inject.Inject

class DataStoreRepositoryImpl @Inject constructor(
    private val context: Context
) : DataStoreRepository {

    private val Context.datastore: DataStore<Preferences> by preferencesDataStore(
        name = Constants.APP_DATASTORE
    )

    override suspend fun setUserInfo(user: UserInfo) {
        context.datastore.edit { preferences ->
            preferences[stringPreferencesKey(Constants.TOKEN)] = user.token
            preferences[stringPreferencesKey(Constants.NICKNAME)] = user.nickName
            preferences[stringPreferencesKey(Constants.PROFILE_IMAGE)] = user.profileImage
        }
    }

    override suspend fun getUserInfo(): Flow<UserInfo> = context.datastore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw  exception
            }
        }
        .map { preferences ->
            UserInfo(
                token = preferences[stringPreferencesKey(Constants.TOKEN)] ?: "",
                nickName = preferences[stringPreferencesKey(Constants.NICKNAME)]  ?: "",
                profileImage = preferences[stringPreferencesKey(Constants.PROFILE_IMAGE)] ?: ""
            )
        }

    override suspend fun clearAll() {
        context.datastore.edit { preferences ->
            preferences.clear()
        }
    }
}